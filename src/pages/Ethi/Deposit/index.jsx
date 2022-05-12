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

import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"
import CustomTextField from "../../../components/CustomTextField"
import Muted from "../../../components/Typography/Muted"
import Button from "../../../components/CustomButtons/Button"
import { warmDialog } from "./../../../reducers/meta-reducer"
import { toFixed, formatBalance } from "../../../helpers/number-format"

// === Constants === //
import { WETH_ADDRESS } from "./../../../constants/token"

// === Utils === //
import noop from "lodash/noop"

import styles from "./style"

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

export default function Deposit({
  address,
  ethBalance,
  ethDecimals,
  wethBalance,
  wethDecimals,
  userProvider,
  onConnect,
  VAULT_ABI,
  VAULT_ADDRESS,
  ETH_ADDRESS,
  IERC20_ABI
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [ethValue, setEthValue] = useState("")
  const [wethValue, setWethValue] = useState("")
  const [mintGasLimit, setMintGasLimit] = useState(BigNumber.from("0"))
  const [gasPriceCurrent, setGasPriceCurrent] = useState()
  const [estimateValue, setEstimateValue] = useState("0")
  const [estimateValueForWeth, setEstimateValueForWeth] = useState("0")
  const [isLoading, setIsLoading] = useState(false)

  const [currentDepositIsEth, setCurrentDepositIsEth] = useState(true)
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

  /**
   * 校验weth的value是否为有效输入
   * @returns
   */
   function isValidWethValue() {
    const balance = wethBalance
    const decimals = wethDecimals
    const value = wethValue
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

  const handleInputChange = (event) => {
    setEthValue(event.target.value)
  }

  const handleWethInputChange = (event) => {
    setWethValue(event.target.value)
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

  const handleMaxClickWeth = () => {
    setWethValue(formatBalance(wethBalance.gt(0) ? wethBalance : 0, wethDecimals, { showAll: true }))
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
  
  const dipositWeth = async () => {
    clearTimeout(loadingTimer.current)
    const isValid = isValidWethValue()
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
      BN(wethValue)
        .multipliedBy(
          BigNumber.from(10)
            .pow(wethDecimals)
            .toString(),
        )
        .toFixed(),
    )
    console.log('nextTokens=', WETH_ADDRESS, amount)
    const wethContract = new ethers.Contract(WETH_ADDRESS, IERC20_ABI, userProvider)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const signer = userProvider.getSigner()
    const nVaultWithUser = vaultContract.connect(signer)
    const wethContractWithUser = wethContract.connect(signer)
    //
    // 取款逻辑参考：https://github.com/PiggyFinance/piggy-finance-web/issues/178
    // 获取当前允许的额度
    const allowanceAmount = await wethContractWithUser.allowance(address, VAULT_ADDRESS)
    // 如果充值金额大于允许的额度，则需要重新设置额度
    if (amount.gt(allowanceAmount)) {
      // 如果已经设置了，allowance Amount，则需要进行补齐allowance操作
      if (allowanceAmount.gt(0)) {
        console.log('补充allowance:', amount.sub(allowanceAmount).toString())
        await wethContractWithUser.increaseAllowance(VAULT_ADDRESS, amount.sub(allowanceAmount)).then(tx => tx.wait()).catch((e) => {
          // 如果是用户自行取消的，则直接返回
          if(e.code === 4001) return
          // 如果补齐失败，则需要使用最糟的方式，将allowance设置为0后，再设置成新的额度。
          return wethContractWithUser.approve(VAULT_ADDRESS, 0)
            .then(tx => tx.wait())
            .then(() => wethContractWithUser.approve(VAULT_ADDRESS, amount).then(tx => tx.wait()))
        })
      } else {
        console.log("当前授权：", allowanceAmount.toString(), "准备授权：", amount.toString())
        const secondApproveTx = await wethContractWithUser.approve(VAULT_ADDRESS, amount)
        await secondApproveTx.wait()
      }
    }
    let isSuccess = false

    await nVaultWithUser.mint(WETH_ADDRESS, amount, {
      from: address,
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
      setWethValue("")
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

  const estimateMintForWeth = debounce(async () => {
    const isValid = isValidWethValue()
    if (!isValid) {
      setEstimateValueForWeth(toFixed(0, BigNumber.from(10).pow(ethDecimals), 6))
      return
    }
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const amount = BigNumber.from(
      BN(wethValue)
        .multipliedBy(
          BigNumber.from(10)
            .pow(wethDecimals)
            .toString(),
        )
        .toFixed(),
    )
    const result = await vaultContract.callStatic.estimateMint(WETH_ADDRESS, amount)
    setEstimateValueForWeth(toFixed(result._ethiAmount, BigNumber.from(10).pow(wethDecimals), 6))
  }, 500)

  useEffect(() => {
    if (!currentDepositIsEth) return
    estimateMint()
    return () => estimateMint.cancel()
    // eslint-disable-next-line
  }, [ethValue, currentDepositIsEth])

  useEffect(() => {
    if (currentDepositIsEth) return
    estimateMintForWeth()
    return () => estimateMintForWeth.cancel()
    // eslint-disable-next-line
  }, [wethValue, currentDepositIsEth])

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
  const isWethValid = isValidWethValue()

  return (
    <>
      <GridContainer classes={{ root: classes.depositContainer }}>
        <GridItem xs={12} sm={12} md={12} lg={12} className={!currentDepositIsEth ? classes.tokenInputWrapper : classes.currentDeposit} 
          onClick={() => {
            setCurrentDepositIsEth(true)
            setWethValue('')
            setEstimateValueForWeth("0")
          }}>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <div className={classes.inputLabelWrapper}>
                <div className={classes.tokenInfo}>
                  <img className={classes.tokenLogo} alt='' src={`./images/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png`} />
                  <span className={classes.tokenName}>ETH</span>
                </div> 
                <Muted title={formatBalance(ethBalance, ethDecimals, { showAll: true })}>
                  {`Balance: ${formatBalance(ethBalance, ethDecimals)}`}
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
        <GridItem xs={12} sm={12} md={12} lg={12} className={currentDepositIsEth ? classes.tokenInputWrapper : classes.currentDeposit} 
          onClick={() => {
            setCurrentDepositIsEth(false)
            setEthValue("")
            setEstimateValue("0")
          }}>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <div className={classes.inputLabelWrapper}>
                <div className={classes.tokenInfo}>
                  <img className={classes.tokenLogo} alt='' src={`./images/${WETH_ADDRESS}.png`} />
                  <span className={classes.tokenName}>WETH</span>
                </div> 
                <Muted title={formatBalance(wethBalance, wethDecimals, { showAll: true })}>
                  {`Balance: ${formatBalance(wethBalance, wethDecimals)}`}
                </Muted>
              </div>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <CustomTextField
                value={wethValue}
                onChange={handleWethInputChange}
                placeholder="deposit amount"
                maxEndAdornment
                onMaxClick={handleMaxClickWeth}
                error={!isUndefined(isWethValid) && !isWethValid}
              />
            </GridItem>
          </GridContainer>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.depositComfirmArea}>
            <Muted>
              <p style={{ fontSize: 16, wordBreak: "break-all", letterSpacing: "0.01071em" }}>
                Estimated:
                &nbsp;{ currentDepositIsEth ? estimateValue: estimateValueForWeth }
                &nbsp;ETHi
              </p>
            </Muted>
            <Button
              disabled={isLogin && ((currentDepositIsEth && !isValid) || (!currentDepositIsEth && !isWethValid))}
              color='colorfull'
              onClick={isLogin ? ( currentDepositIsEth ? diposit: dipositWeth ) : onConnect}
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
