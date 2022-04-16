import React, { useState, useEffect, useRef } from "react"
import * as ethers from "ethers"
import BN from "bignumber.js"
import { useDispatch } from "react-redux"
import isUndefined from "lodash/isUndefined"
import map from "lodash/map"
import some from "lodash/some"
import every from "lodash/every"
import debounce from "lodash/debounce"
import isEmpty from "lodash/isEmpty"
import { makeStyles } from "@material-ui/core/styles"
import CircularProgress from "@material-ui/core/CircularProgress"
import Modal from "@material-ui/core/Modal"
import Paper from "@material-ui/core/Paper"

import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"
import CustomTextField from "../../../components/CustomTextField"
import Muted from "../../../components/Typography/Muted"
import Button from "../../../components/CustomButtons/Button"
import { warmDialog } from "./../../../reducers/meta-reducer"
import { toFixed, formatBalance } from "../../../helpers/number-format"
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
  address,
  usdtBalance,
  usdtDecimals,
  usdcBalance,
  usdcDecimals,
  daiBalance,
  daiDecimals,
  usdiDecimals,
  userProvider,
  onConnect
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [usdtValue, setUsdtValue] = useState("")
  const [usdcValue, setUsdcValue] = useState("")
  const [daiValue, setDaiValue] = useState("")
  const [estimateValue, setEstimateValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const loadingTimer = useRef()

  const tokenBasicState = {
    [TOKEN.USDT]: {
      value: usdtValue,
      balance: usdtBalance,
      decimals: usdtDecimals,
    },
    [TOKEN.USDC]: {
      value: usdcValue,
      balance: usdcBalance,
      decimals: usdcDecimals
    },
    [TOKEN.DAI]: {
      value: daiValue,
      balance: daiBalance,
      decimals: daiDecimals
    }
  }

  const formConfig = [{
    name: TOKEN.USDT,
    address: USDT_ADDRESS,
    setValue: setUsdtValue,
    isValid: isValidValue(TOKEN.USDT),
    ...tokenBasicState[TOKEN.USDT],
  }, {
    name: TOKEN.USDC,
    address: USDC_ADDRESS,
    setValue: setUsdcValue,
    isValid: isValidValue(TOKEN.USDC),
    ...tokenBasicState[TOKEN.USDC],
  }, {
    name: TOKEN.DAI,
    address: DAI_ADDRESS,
    setValue: setDaiValue,
    isValid: isValidValue(TOKEN.DAI),
    ...tokenBasicState[TOKEN.DAI],
  }]

  /**
   * 校验value是否为有效输入
   * @returns
   */
  function isValidValue(token) {
    const { value, balance, decimals } = tokenBasicState[token]
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
    // 精度处理完之后，应该为整数
    const nextFromValueString = nextValue.multipliedBy(
      BigNumber.from(10)
        .pow(decimals)
        .toString(),
    )
    if (nextFromValueString.toFixed().indexOf(".") !== -1) return false
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
  }

  const handleMaxClick = (item) => {
    item.setValue(formatBalance(item.balance, item.decimals, { showAll: true }))
  }

  const getTokenAndAmonut = () => {
    const isValidUsdtValue = isValidValue(TOKEN.USDT)
    const isValidUsdcValue = isValidValue(TOKEN.USDC)
    const isValidDaiValue = isValidValue(TOKEN.DAI)
    const nextTokens = []
    const nextAmounts = []
    if (isValidUsdtValue) {
      const nextUsdtValue = BigNumber.from(
        BN(usdtValue)
          .multipliedBy(
            BigNumber.from(10)
              .pow(usdtDecimals)
              .toString(),
          )
          .toFixed(),
      )
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(USDT_ADDRESS)
    }
    if (isValidUsdcValue) {
      const nextUsdtValue = BigNumber.from(
        BN(usdcValue)
          .multipliedBy(
            BigNumber.from(10)
              .pow(usdcDecimals)
              .toString(),
          )
          .toFixed(),
      )
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(USDC_ADDRESS)
    }
    if (isValidDaiValue) {
      const nextUsdtValue = BigNumber.from(
        BN(daiValue)
          .multipliedBy(
            BigNumber.from(10)
              .pow(daiDecimals)
              .toString(),
          )
          .toFixed(),
      )
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(DAI_ADDRESS)
    }
    return [nextTokens, nextAmounts]
  }

  // TODO 支持多币存
  const diposit = async () => {
    // 旧的逻辑，需要重新实现
    // // 如果输入的数字不合法，弹出提示框
    // if (!isValidValue(TOKEN.USDT)) {
    //   return dispatch(
    //     warmDialog({
    //       open: true,
    //       type: "warning",
    //       message: "Please enter the correct value",
    //     }),
    //   )
    // }
    // setIsLoading(true)
    // // 获取usdc的合约
    // const usdtContract = new ethers.Contract(USDT_ADDRESS, IERC20_ABI, userProvider)
    // const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    // const signer = userProvider.getSigner()
    // const usdtContractWithUser = usdtContract.connect(signer)
    // const nVaultWithUser = vaultContract.connect(signer)
    // let nextValue = BigNumber.from(
    //   BN(usdtValue)
    //     .multipliedBy(
    //       BigNumber.from(10)
    //         .pow(usdtDecimals)
    //         .toString(),
    //     )
    //     .toFixed(),
    // )
    // try {
    //   // 获取当前允许的额度
    //   const allowanceAmount = await usdtContractWithUser.allowance(address, VAULT_ADDRESS)
    //   // 如果充值金额大于允许的额度，则需要重新设置额度
    //   if (nextValue.gt(allowanceAmount)) {
    //     // 如果允许的额度为0，则直接设置新的额度。否则，则设置为0后，再设置新的额度。
    //     if (allowanceAmount.gt(0)) {
    //       const firstApproveTx = await usdtContractWithUser.approve(VAULT_ADDRESS, 0)
    //       await firstApproveTx.wait()
    //     }
    //     console.log("当前授权：", allowanceAmount.toString(), "准备授权：", nextValue.toString())
    //     const secondApproveTx = await usdtContractWithUser.approve(VAULT_ADDRESS, nextValue)
    //     await secondApproveTx.wait()
    //   }
    //   const depositTx = await nVaultWithUser.deposit(nextValue)
    //   await depositTx.wait()
    //   setUsdtValue("")
    //   dispatch(
    //     warmDialog({
    //       open: true,
    //       type: "success",
    //       message: "Success!",
    //     }),
    //   )
    // } catch (error) {
    //   if (error && error.data) {
    //     if (error.data.message && error.data.message.endsWith("'ES or AD'")) {
    //       dispatch(
    //         warmDialog({
    //           open: true,
    //           type: "error",
    //           message: "Vault has been shut down, please try again later!",
    //         }),
    //       )
    //     }
    //   }
    // }
    // setTimeout(() => {
    //   setIsLoading(false)
    // }, 2000)

    // 取款逻辑参考：https://github.com/PiggyFinance/piggy-finance-web/issues/178
    clearTimeout(loadingTimer.current)
    // step1: 校验三个币，起码一个有值
    const isValidUsdtValue = isValidValue(TOKEN.USDT)
    const isValidUsdcValue = isValidValue(TOKEN.USDC)
    const isValidDaiValue = isValidValue(TOKEN.DAI)
    if (!isValidUsdtValue && !isValidUsdcValue && !isValidDaiValue) {
      return dispatch(
        warmDialog({
          open: true,
          type: "warning",
          message: "Please enter the correct value",
        }),
      )
    }
    // step2：折算精度，授权三个币及数值
    setIsLoading(true)
    const [nextTokens, nextAmounts] = getTokenAndAmonut()
    console.log('nextTokens=', nextTokens, nextAmounts)
    const signer = userProvider.getSigner()
    for (const key in nextTokens) {
      const contract = new ethers.Contract(nextTokens[key], IERC20_ABI, userProvider)
      const contractWithUser = contract.connect(signer)
        // 获取当前允许的额度
      const allowanceAmount = await contractWithUser.allowance(address, VAULT_ADDRESS)
      // 如果充值金额大于允许的额度，则需要重新设置额度
      if (nextAmounts[key].gt(allowanceAmount)) {
        // 如果允许的额度为0，则直接设置新的额度。否则，则设置为0后，再设置新的额度。
        if (allowanceAmount.gt(0)) {
          console.log('补充allowance:', nextAmounts[key].sub(allowanceAmount).toString())
          await contractWithUser.increaseAllowance(VAULT_ADDRESS, nextAmounts[key].sub(allowanceAmount)).then(tx => tx.wait()).catch((e) => {
            // 如果是用户自行取消的，则直接返回
            if(e.code === 4001) {
              setIsLoading(false)
              return Promise.reject(e)
            }
            // 如果补齐失败，则需要使用最糟的方式，将allowance设置为0后，再设置成新的额度。
            return contractWithUser.approve(VAULT_ADDRESS, 0)
              .then(tx => tx.wait())
              .then(() => contractWithUser.approve(VAULT_ADDRESS, nextAmounts[key]).then(tx => tx.wait()))
          })
        } else {
          console.log("当前授权：", allowanceAmount.toString(), "准备授权：", nextAmounts[key].toString())
          await contractWithUser.approve(VAULT_ADDRESS, nextAmounts[key]).then(tx => tx.wait()).catch((e) => {
            // 如果是用户自行取消的，则直接返回
            if(e.code === 4001) {
              setIsLoading(false)
              return Promise.reject(e)
            }
          })
        }
      }
    }
    // step3: 存钱
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const nVaultWithUser = vaultContract.connect(signer)
    let isSuccess = false
    await nVaultWithUser.mint(nextTokens, nextAmounts, 0)
      .then(tx => tx.wait())
      .then(() => {
        isSuccess = true
      })
      .catch((error) => {
        if (error && error.data) {
          if (error.data.message && 
            (error.data.message.endsWith("'ES or AD'") || error.data.message.endsWith("'ES'"))
          ) {
            dispatch(
              warmDialog({
                open: true,
                type: "error",
                message: "Vault has been shut down, please try again later!",
              }),
            )
          }
        }
        setIsLoading(false)
      })
    
    if (isSuccess) {
      setUsdtValue("")
      setUsdcValue("")
      setDaiValue("")
    }

    loadingTimer.current = setTimeout(() => {
      setIsLoading(false)
      if (isSuccess) {
        dispatch(
          warmDialog({
            open: true,
            type: "success",
            message: "Success!",
          }),
        )
      }
    }, 2000)
  }

  const estimateMint = debounce(async () => {
    const isValidUsdtValue = isValidValue(TOKEN.USDT)
    const isValidUsdcValue = isValidValue(TOKEN.USDC)
    const isValidDaiValue = isValidValue(TOKEN.DAI)
    const isFalse = (v) => v === false
    const [tokens, amounts] = getTokenAndAmonut()
    if (isFalse(isValidUsdtValue) || isFalse(isValidUsdcValue) || isFalse(isValidDaiValue) || tokens.length === 0) {
      setEstimateValue(toFixed(0, BigNumber.from(10).pow(usdiDecimals), 6))
      return
    }
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const result = await vaultContract.callStatic.estimateMint(tokens, amounts)
    setEstimateValue(toFixed(result.priceAdjustedDeposit, BigNumber.from(10).pow(usdiDecimals), 6))
  }, 500)

  //TODO: 方便测试，待删除
  const printOutAllowance = async () => {
    const [nextTokens] = getTokenAndAmonut()
    const signer = userProvider.getSigner()
    for (const key in nextTokens) {
      const contract = new ethers.Contract(nextTokens[key], IERC20_ABI, userProvider)
      const contractWithUser = contract.connect(signer)
        // 获取当前允许的额度
      const allowanceAmount = await contractWithUser.allowance(address, VAULT_ADDRESS)
      console.log(nextTokens[key], 'allowanceAmount=', allowanceAmount.toString())
    }
  }

  useEffect(() => {
    estimateMint()
    return () => estimateMint.cancel()
    // eslint-disable-next-line
  }, [usdcValue, usdtValue, daiValue])

  const isLogin = !isEmpty(userProvider)

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
                  <Muted title={formatBalance(item.balance, item.decimals, { showAll: true })}>
                    {`Balance: ${formatBalance(item.balance, item.decimals)}`}
                  </Muted>
                </div>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <CustomTextField
                  value={item.value}
                  onChange={(event) => handleInputChange(event, item)}
                  placeholder="deposit amount"
                  maxEndAdornment
                  onMaxClick={() => handleMaxClick(item)}
                  error={!isUndefined(item.isValid) && !item.isValid}
                />
              </GridItem>
            </GridContainer>
          </GridItem>
        ))}
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.depositComfirmArea}>
            <Muted>
              <p onClick={printOutAllowance} style={{ fontSize: 16, wordBreak: "break-all", letterSpacing: "0.01071em" }}>
                Estimated:
                &nbsp;{estimateValue}
                &nbsp;USDi
              </p>
            </Muted>
            <Button
              disabled={isLogin && (
                some(formConfig, item => isValidValue(item.name) === false) || every(formConfig, item => isValidValue(item.name) !== true)
              )}
              color='colorfull'
              onClick={isLogin ? diposit : onConnect}
              style={{ minWidth: 122, padding: "12px 16px", margin: "6px 0" }}
            >
              {isLogin ? "Deposit" : "Connect Wallet"}
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
