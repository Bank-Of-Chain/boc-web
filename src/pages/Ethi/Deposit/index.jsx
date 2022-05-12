import React, { useState, useEffect, useRef } from "react"
import * as ethers from "ethers"
import BN from "bignumber.js"
import { useDispatch } from "react-redux"
import isUndefined from "lodash/isUndefined"
import debounce from "lodash/debounce"
import isEmpty from "lodash/isEmpty"
import get from "lodash/get"
import { makeStyles } from "@material-ui/core/styles"
import CircularProgress from "@material-ui/core/CircularProgress"
import Modal from "@material-ui/core/Modal"
import Paper from "@material-ui/core/Paper"
import Tooltip from "@material-ui/core/Tooltip"
import InfoIcon from "@material-ui/icons/Info"

import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"
import CustomTextField from "../../../components/CustomTextField"
import Muted from "../../../components/Typography/Muted"
import Button from "../../../components/CustomButtons/Button"
import { warmDialog } from "./../../../reducers/meta-reducer"
import { toFixed, formatBalance } from "../../../helpers/number-format"

// === Utils === //
import noop from "lodash/noop"

import styles from "./style"

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

export default function Deposit({
  address,
  ethBalance,
  ethDecimals,
  userProvider,
  onConnect,
  VAULT_ABI,
  VAULT_ADDRESS,
  ETH_ADDRESS,
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [ethValue, setEthValue] = useState("")
  const [mintGasLimit, setMintGasLimit] = useState(BigNumber.from("0"))
  const [gasPriceCurrent, setGasPriceCurrent] = useState()
  const [estimateValue, setEstimateValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const loadingTimer = useRef()

  const getGasFee = () => {
    if (!gasPriceCurrent) {
      return 0
    }
    const gasPrice = BigNumber.from(parseInt(gasPriceCurrent, 16).toString())
    // metamask gaslimit 比预估大些
    const metamaskExtraLimit = 114
    return mintGasLimit.add(metamaskExtraLimit).mul(gasPrice)
  }

  /**
   * 校验value是否为有效输入
   * @returns
   */
  function isValidValue() {
    const balance = ethBalance
    const decimals = ethDecimals
    const value = ethValue
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

    if (balance.sub(BigNumber.from(nextFromValue.toFixed())).lt(getGasFee())) return false

    return true
  }

  const handleInputChange = (event) => {
    setEthValue(event.target.value)
  }

  const handleMaxClick = () => {
    const v = getGasFee();
    if (v.lte(0)) {
      dispatch(
        warmDialog({
          open: true,
          type: "warning",
          message: "Since the latest Gasprice is not available, it is impossible to estimate the gas fee currently!",
        }),
      )
      return 
    }
    const maxValue = ethBalance.sub(v)
    setEthValue(formatBalance(maxValue.gt(0) ? maxValue : 0, ethDecimals, { showAll: true }))
  }

  const diposit = async () => {
    clearTimeout(loadingTimer.current)
    const isValid = isValidValue()
    if (!isValid) {
      return dispatch(
        warmDialog({
          open: true,
          type: "warning",
          message: "Please enter the correct value",
        }),
      )
    }
    setIsLoading(true)
    const amount = BigNumber.from(
      BN(ethValue)
        .multipliedBy(
          BigNumber.from(10)
            .pow(ethDecimals)
            .toString(),
        )
        .toFixed(),
    )
    console.log('nextTokens=', ETH_ADDRESS, amount)
    const signer = userProvider.getSigner()
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const nVaultWithUser = vaultContract.connect(signer)
    let isSuccess = false

    await nVaultWithUser.mint(ETH_ADDRESS, amount, {
      from: address,
      value: amount,
    })
      .then(tx => tx.wait())
      .then(() => {
        isSuccess = true
      })
      .catch((error) => {
        if (error && error.data) {
          const errorMsg = get(error.data, 'message', '')
          let tip = ''
          if (errorMsg.endsWith("'ES or AD'") || errorMsg.endsWith("'ES'")) {
            tip = 'Vault has been shut down, please try again later!'
          }
          if (errorMsg.endsWith("'AD'")) {
            tip = 'Vault is in adjustment status, please try again later!'
          }
          if (errorMsg.endsWith("'RP'")) {
            tip = 'Vault is in rebase status, please try again later!'
          }
          if (tip) {
            dispatch(
              warmDialog({
                open: true,
                type: "error",
                message: tip,
              }),
            )
          }
        }
        setIsLoading(false)
      })
    
    if (isSuccess) {
      setEthValue("")
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
    const isValid = isValidValue()
    if (!isValid) {
      setEstimateValue(toFixed(0, BigNumber.from(10).pow(ethDecimals), 6))
      return
    }
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const amount = BigNumber.from(
      BN(ethValue)
        .multipliedBy(
          BigNumber.from(10)
            .pow(ethDecimals)
            .toString(),
        )
        .toFixed(),
    )
    const result = await vaultContract.callStatic.estimateMint(ETH_ADDRESS, amount)
    setEstimateValue(toFixed(result._ethiAmount, BigNumber.from(10).pow(ethDecimals), 6))
  }, 500)

  useEffect(() => {
    estimateMint()
    return () => estimateMint.cancel()
    // eslint-disable-next-line
  }, [ethValue])

  // 每隔30s获取一下最新的gasprice，获取异常，则不修改原有数值
  useEffect(() => {
    if (!userProvider) {
      return
    }
    const timer = setInterval(() => {
      userProvider.send("eth_gasPrice").then(setGasPriceCurrent).catch(noop)
    }, 15000)
    return () => clearInterval(timer)
  }, [userProvider])

  useEffect(() => {
    if (isEmpty(userProvider) || mintGasLimit.gt(0) || isEmpty(VAULT_ADDRESS) || isEmpty(VAULT_ABI)) {
      return
    }
    userProvider.send("eth_gasPrice").then(setGasPriceCurrent).catch(noop)
    const signer = userProvider.getSigner()
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const nVaultWithUser = vaultContract.connect(signer)
    nVaultWithUser.estimateGas.mint(ETH_ADDRESS, BigNumber.from(1).pow(ethDecimals), {
      from: address,
      value: BigNumber.from(1).pow(ethDecimals)
    }).then(setMintGasLimit)

    // eslint-disable-next-line
  }, [userProvider, VAULT_ADDRESS, VAULT_ABI])

  const isLogin = !isEmpty(userProvider)
  const isValid = isValidValue()

  return (
    <>
      <GridContainer classes={{ root: classes.depositContainer }}>
        <GridItem xs={12} sm={12} md={12} lg={12} className={classes.tokenInputWrapper}>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <div className={classes.inputLabelWrapper}>
                <div className={classes.tokenInfo}>
                  <img className={classes.tokenLogo} alt='' src={`./images/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png`} />
                  <span className={classes.tokenName}>ETH</span>
                </div> 
                <Muted className={classes.ethBalanceWrapper}>
                  <Tooltip
                    classes={{
                      tooltip: classes.tooltip
                    }}
                    placement='top'
                    title="Please reserve some ETH as transaction gas fee"
                  >
                    <InfoIcon classes={{ root: classes.labelToolTipIcon }} />
                  </Tooltip>
                  <span title={formatBalance(ethBalance, ethDecimals, { showAll: true })}>
                    {`Balance: ${formatBalance(ethBalance, ethDecimals)}`}
                  </span>
                </Muted>
              </div>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <CustomTextField
                value={ethValue}
                onChange={handleInputChange}
                placeholder="deposit amount"
                maxEndAdornment
                onMaxClick={handleMaxClick}
                error={!isUndefined(isValid) && !isValid}
              />
            </GridItem>
          </GridContainer>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.depositComfirmArea}>
            <Muted>
              <p style={{ fontSize: 16, wordBreak: "break-all", letterSpacing: "0.01071em" }}>
                Estimated:
                &nbsp;{estimateValue}
                &nbsp;ETHi
              </p>
            </Muted>
            <Button
              disabled={isLogin && !isValid}
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
