import React, { useState } from "react"
import classNames from 'classnames'
import * as ethers from "ethers"
import BN from "bignumber.js"
import { useDispatch } from "react-redux"
import isUndefined from "lodash/isUndefined"
import map from "lodash/map"
import some from "lodash/some"
import every from "lodash/every"
import { makeStyles } from "@material-ui/core/styles"
import TextField from '@material-ui/core/TextField'
import CircularProgress from "@material-ui/core/CircularProgress"
import Modal from "@material-ui/core/Modal"
import Paper from "@material-ui/core/Paper"

import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"
import Muted from "../../../components/Typography/Muted"
import Button from "../../../components/CustomButtons/Button"
import { warmDialog } from "./../../../reducers/meta-reducer"
import { toFixed } from "../../../helpers/number-format"
import {
  VAULT_ADDRESS,
  VAULT_ABI,
  IERC20_ABI,
  USDT_ADDRESS,
  USDC_ADDRESS,
  DAI_ADDRESS,
} from "../../../constants"

import styles from "./style"

const { BigNumber } = ethers
const useStyles = makeStyles(styles)
const TOKEN = {
  USDT: 'USDT',
  USDC: 'USDC',
  DAI: 'DAI',
}

export default function Deposit({
  usdtBalance,
  usdtDecimals,
  usdcBalance,
  usdcDecimals,
  daiBalance,
  daiDecimals,
  totalAssets,
  totalSupply,
  address,
  userProvider
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [usdtValue, setUsdtValue] = useState("")
  const [usdcValue, setUsdcValue] = useState("")
  const [daiValue, setDaiValue] = useState("")
  const [isUsdtValueMax, setIsUstdValueMax] = useState(false)
  const [isUsdcValueMax, setIsUstcValueMax] = useState(false)
  const [isDaiValueMax, setIsDaiValueMax] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const tokenBasicState = {
    [TOKEN.USDT]: {
      value: usdtValue,
      isValueMax: isUsdtValueMax,
      balance: usdtBalance,
      decimals: usdtDecimals,
    },
    [TOKEN.USDC]: {
      value: usdcValue,
      isValueMax: isUsdcValueMax,
      balance: usdcBalance,
      decimals: usdcDecimals
    },
    [TOKEN.DAI]: {
      value: daiValue,
      isValueMax: isDaiValueMax,
      balance: daiBalance,
      decimals: daiDecimals
    }
  }

  const formConfig = [{
    name: TOKEN.USDT,
    address: USDT_ADDRESS,
    setValue: setUsdtValue,
    setIsValueMax: setIsUstdValueMax,
    isValid: isValidValue(TOKEN.USDT),
    ...tokenBasicState[TOKEN.USDT],
  }, {
    name: TOKEN.USDC,
    address: USDC_ADDRESS,
    setValue: setUsdcValue,
    setIsValueMax: setIsUstcValueMax,
    isValid: isValidValue(TOKEN.USDC),
    ...tokenBasicState[TOKEN.USDC],
  }, {
    name: TOKEN.DAI,
    address: DAI_ADDRESS,
    setValue: setDaiValue,
    setIsValueMax: setIsDaiValueMax,
    isValid: isValidValue(TOKEN.DAI),
    ...tokenBasicState[TOKEN.DAI],
  }]

  /**
   * 校验value是否为有效输入
   * @returns
   */
  function isValidValue(token) {
    const { value, isValueMax, balance, decimals } = tokenBasicState[token]
    if (value === "" || value === "-" || value === '0') return
    // 如果不是一个数值
    if (isNaN(Number(value))) return false
    const nextValue = BN(value)
    const nextFromValue = nextValue.multipliedBy(
      BigNumber.from(10)
        .pow(decimals)
        .toString(),
    )
    // 判断值为正数
    if (nextFromValue.lte(0)) return false
    if (!isValueMax) {
      // 精度处理完之后，应该为整数
      const nextFromValueString = nextValue.multipliedBy(
        BigNumber.from(10)
          .pow(6)
          .toString(),
      )
      if (nextFromValueString.toFixed().indexOf(".") !== -1) return false
    }
    // 数值小于最大数量
    if (balance.lt(BigNumber.from(nextFromValue.toFixed()))) return false
    return true
  }

  const handleInputChange = (event, item) => {
    try {
      item.setValue(event.target.value)
    } catch (error) {
      item.setValue("")
    }
    item.setIsValueMax(false)
  }

  const handleMaxClick = (item) => {
    item.setValue(toFixed(item.balance, BigNumber.from(10).pow(item.decimals), 6, 1))
    item.setIsValueMax(true)
  }

  // TODO 支持多币存
  const diposit = async () => {
    // 如果输入的数字不合法，弹出提示框
    if (!isValidValue(TOKEN.USDT)) {
      return dispatch(
        warmDialog({
          open: true,
          type: "warning",
          message: "Please enter the correct value",
        }),
      )
    }
    setIsLoading(true)
    // 获取usdc的合约
    const usdtContract = new ethers.Contract(USDT_ADDRESS, IERC20_ABI, userProvider)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const signer = userProvider.getSigner()
    const usdtContractWithUser = usdtContract.connect(signer)
    const nVaultWithUser = vaultContract.connect(signer)
    let nextValue = BigNumber.from(
      BN(usdtValue)
        .multipliedBy(
          BigNumber.from(10)
            .pow(usdtDecimals)
            .toString(),
        )
        .toFixed(),
    )
    try {
      // 获取当前允许的额度
      const allowanceAmount = await usdtContractWithUser.allowance(address, VAULT_ADDRESS)
      // 如果充值金额大于允许的额度，则需要重新设置额度
      if (nextValue.gt(allowanceAmount)) {
        // 如果允许的额度为0，则直接设置新的额度。否则，则设置为0后，再设置新的额度。
        if (allowanceAmount.gt(0)) {
          const firstApproveTx = await usdtContractWithUser.approve(VAULT_ADDRESS, 0)
          await firstApproveTx.wait()
        }
        console.log("当前授权：", allowanceAmount.toString(), "准备授权：", nextValue.toString())
        const secondApproveTx = await usdtContractWithUser.approve(VAULT_ADDRESS, nextValue)
        await secondApproveTx.wait()
      }
      const depositTx = await nVaultWithUser.deposit(nextValue)
      await depositTx.wait()
      setUsdtValue("")
      dispatch(
        warmDialog({
          open: true,
          type: "success",
          message: "Success!",
        }),
      )
    } catch (error) {
      if (error && error.data) {
        if (error.data.message && error.data.message.endsWith("'ES or AD'")) {
          dispatch(
            warmDialog({
              open: true,
              type: "error",
              message: "Vault has been shut down, please try again later!",
            }),
          )
        }
      }
    }
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  return (
    <>
      <GridContainer classes={{ root: classes.depositContainer }}>
        {map(formConfig, (item) => (
          <GridItem key={item.name} xs={12} sm={12} md={12} lg={12} className={classes.tokenInputWrapper}>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <div className={classes.inputLabelWrapper}>
                  <div className={classes.tokenInfo}>
                    <img className={classes.tokenLogo} alt='' src={`./images/${item.address}.png`} />
                    <span className={classes.tokenName}>{item.name}</span>
                  </div> 
                  <Muted>{`Balance: ${toFixed(item.balance, BigNumber.from(10).pow(item.decimals), 6)}`}</Muted>
                </div>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <TextField
                  classes={{
                    root: classes.textField
                  }}
                  InputProps={{
                    endAdornment: (
                      <span
                        className={classNames(classes.endAdornment, {
                          [classes.endAdornmentActive]: item.isValueMax
                        })}
                        onClick={() => handleMaxClick(item)}
                      >
                        Max
                      </span>
                    )
                  }}
                  placeholder="deposit amount"
                  variant="outlined"
                  value={item.value}
                  onChange={(event) => handleInputChange(event, item)}
                  error={!isUndefined(item.isValid) && !item.isValid}
                />
              </GridItem>
            </GridContainer>
          </GridItem>
        ))}
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.depositComfirmArea}>
            <Muted>
              <p style={{ fontSize: 16, wordBreak: "break-all", letterSpacing: "0.01071em" }}>
                Estimated Shares：
                {isValidValue(TOKEN.USDT) &&
                  toFixed(
                    totalAssets.gt(0) ? BN(usdtValue)
                      .multipliedBy(totalSupply.toString())
                      .div(totalAssets.toString()).toFixed() 
                      : BN(usdtValue)
                      .toFixed(),
                    1,
                    usdtDecimals,
                    1
                  )}
              </p>
            </Muted>
            <Button
              disabled={some(formConfig, item => isValidValue(item.name) === false) || every(formConfig, item => isValidValue(item.name) !== true)}
              color='colorfull'
              onClick={diposit}
              style={{ width: 122, margin: "6px 0" }}
            >
              Deposit
            </Button>
          </div>
        </GridItem>
      </GridContainer>
      <Modal
        className={classes.modal}
        open={isLoading}
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
      >
        <Paper
          elevation={3}
          style={{
            padding: 20,
            minWidth: 430,
            color: "rgba(255,255,255, 0.87)",
            border: "1px solid",
            background: "#150752",
          }}
        >
          <div className={classes.modalBody}>
            <CircularProgress color='inherit' />
            <p>On Deposit...</p>
          </div>
        </Paper>
      </Modal>
    </>
  )
}
