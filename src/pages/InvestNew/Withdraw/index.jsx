import React, { useState, useEffect } from 'react'
import * as ethers from "ethers"
import BN from "bignumber.js"
import classNames from 'classnames'
import { useDispatch } from "react-redux"
import CountTo from "react-count-to"
import { makeStyles } from "@material-ui/core/styles"
import CircularProgress from "@material-ui/core/CircularProgress"
import Modal from "@material-ui/core/Modal"
import Paper from "@material-ui/core/Paper"
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline"
import AddIcon from "@material-ui/icons/Add"
import AndroidIcon from "@material-ui/icons/Android"
import CropFreeIcon from "@material-ui/icons/CropFree"
import CropIcon from "@material-ui/icons/Crop"
import RadioGroup from "@material-ui/core/RadioGroup"
import Tooltip from "@material-ui/core/Tooltip"
import InfoIcon from "@material-ui/icons/Info"
import Step from "@material-ui/core/Step"
import WarningIcon from "@material-ui/icons/Warning"
import Switch from "@material-ui/core/Switch"
import FormControlLabel from "@material-ui/core/FormControlLabel"

import SimpleSelect from "../../../components/SimpleSelect"
import CustomTextField from "../../../components/CustomTextField"
import BocStepper from "../../../components/Stepper/Stepper"
import BocStepLabel from "../../../components/Stepper/StepLabel"
import BocStepIcon from "../../../components/Stepper/StepIcon"
import BocStepConnector from "../../../components/Stepper/StepConnector"
import ButtonSelector from "../../../components/ButtonSelector"
import CustomRadio from "./../../../components/Radio/Radio"
import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"
import Muted from "../../../components/Typography/Muted"
import Button from "../../../components/CustomButtons/Button"
import CustomInput from "../../../components/CustomInput/CustomInput"
import { warmDialog } from "./../../../reducers/meta-reducer"
import { toFixed } from "../../../helpers/number-format"
import {
  VAULT_ADDRESS,
  VAULT_ABI,
  IERC20_ABI,
  USDT_ADDRESS,
  USDC_ADDRESS,
  DAI_ADDRESS,
  EXCHANGE_AGGREGATOR_ABI,
  EXCHANGE_EXTRA_PARAMS,
  MULTIPLE_OF_GAS,
  MAX_GAS_LIMIT, ORACLE_ADDITIONAL_SLIPPAGE,
} from "../../../constants"

// === Utils === //
import { getBestSwapInfo } from "piggy-finance-utils"
import isUndefined from "lodash/isUndefined"
import map from "lodash/map"
import get from "lodash/get"
import debounce from "lodash/debounce"
import compact from "lodash/compact"
import isEmpty from "lodash/isEmpty"
import some from "lodash/some"
import filter from "lodash/filter"
import isNumber from "lodash/isNumber"

import styles from "./style"

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

const steps = [
  { title: "Shares Validation" },
  { title: "Pre Withdraw" },
  { title: "Exchange Path Query" },
  { title: "Gas Estimates" },
  { title: "Withdraw" },
]

const getExchangePlatformAdapters = async exchangeAggregator => {
  const adapters = await exchangeAggregator.getExchangeAdapters()
  const exchangePlatformAdapters = {}
  for (let i = 0; i < adapters.identifiers_.length; i++) {
    exchangePlatformAdapters[adapters.identifiers_[i]] = adapters.exchangeAdapters_[i]
  }
  return exchangePlatformAdapters
}

export default function Withdraw({
  beforePerFullShare,
  perFullShare,
  toBalance,
  usdtDecimals,
  usdiDecimals,
  userProvider,
  onConnect
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [token, setToken] = useState(USDT_ADDRESS)
  const [toValue, setToValue] = useState("")
  const [allowMaxLoss, setAllowMaxLoss] = useState("0.3")
  const [slipper, setSlipper] = useState("0.3")
  const [shouldExchange, setShouldExchange] = useState(true)
  const [estimateWithdrawArray, setEstimateWithdrawArray] = useState([])
  const [isEstimate, setIsEstimate] = useState(false)
  const [isOpenEstimate, setIsOpenEstimate] = useState(false)
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [withdrawError, setWithdrawError] = useState({})

  const estimateWithdraw = debounce(async () => {
    setIsEstimate(true)
    const nextValue = BigNumber.from(
      BN(toValue)
        .multipliedBy(
          BigNumber.from(10)
            .pow(usdiDecimals)
            .toString(),
        )
        .toFixed(),
    )
    const allowMaxLossValue = BigNumber.from(10000 - parseInt(100 * parseFloat(allowMaxLoss))).mul(nextValue).div(BigNumber.from(1e5))
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const signer = userProvider.getSigner()
    const vaultContractWithSigner = vaultContract.connect(signer)

    try {
      console.log("estimate shouldExchange:", shouldExchange)
      let [tokens, amounts] = await vaultContractWithSigner.callStatic.burn(
        nextValue,
        token,
        allowMaxLossValue,
        false,
        [],
      )
      if (shouldExchange) {
        const exchangeManager = await vaultContract.exchangeManager()
        const exchangeManagerContract = new ethers.Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
        const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract)
        console.log("estimate get exchange path:", tokens, amounts)
        // 查询兑换路径
        let exchangeArray = await Promise.all(
          map(tokens, async (tokenItem, index) => {
            const exchangeAmounts = amounts[index].toString()
            if (tokenItem === token || exchangeAmounts === "0") {
              return {}
            }
            const fromConstrat = new ethers.Contract(tokenItem, IERC20_ABI, userProvider)
            const toTokenConstrat = new ethers.Contract(token, IERC20_ABI, userProvider)
            const fromToken = {
              decimals: parseInt((await fromConstrat.decimals()).toString()),
              symbol: await fromConstrat.symbol(),
              address: tokenItem,
            }
            try {
              const bestSwapInfo = await getBestSwapInfo(
                fromToken,
                {
                  decimals: parseInt((await toTokenConstrat.decimals()).toString()),
                  address: token,
                },
                amounts[index].toString(),
                parseInt(100 * parseFloat(slipper)) || 0,
                ORACLE_ADDITIONAL_SLIPPAGE,
                exchangePlatformAdapters,
                EXCHANGE_EXTRA_PARAMS,
              )
              if (isEmpty(bestSwapInfo)) {
                throw new Error("兑换路径获取失败")
              }
              return {
                fromToken: tokenItem,
                toToken: token,
                fromAmount: exchangeAmounts,
                exchangeParam: bestSwapInfo,
              }
            } catch (error) {
              return
            }
          }),
        )

        if (some(exchangeArray, isUndefined)) {
          dispatch(
            warmDialog({
              open: true,
              type: "error",
              message: "Failed to fetch the exchange path. Please cancel the exchange or try again later.",
            }),
          )
          return
        }
        console.log("exchangeArray=", exchangeArray)
        const nextArray = filter(exchangeArray, i => !isEmpty(i));
        [tokens, amounts] = await vaultContractWithSigner.callStatic.burn(
          nextValue,
          token,
          allowMaxLossValue,
          true,
          nextArray,
        )
        console.log("estimate withdraw result:", tokens, amounts)
      } else {
        console.log("estimate directly return:", tokens, amounts)
      }
      let nextEstimateWithdrawArray = compact(
        await Promise.all(
          map(tokens, async (token, index) => {
            const tokenContract = new ethers.Contract(token, IERC20_ABI, userProvider)
            const amount = get(amounts, index, BigNumber.from(0))
            if (amount.gt(0)) {
              return {
                tokenAddress: token,
                decimals: await tokenContract.decimals(),
                amounts: amount,
              }
            }
          }),
        ),
      )

      setEstimateWithdrawArray(nextEstimateWithdrawArray)
    } catch (error) {
      console.log("estimate withdraw error", error)
      console.log("withdraw original error :", error)
      let errorMsg = error.toString()
      if (error?.message) {
        errorMsg = error.message
      }
      if (error?.data?.message) {
        errorMsg = error.data.message
      }
      if (error?.error?.data?.originalError?.message) {
        errorMsg = error.error.data.originalError.message
      }
      if (errorMsg.endsWith("'ES or AD'")) {
        dispatch(
          warmDialog({
            open: true,
            type: "error",
            message: "Vault has been shut down, please try again later!",
          }),
        )
      } else if (errorMsg.endsWith("'loss much'") || errorMsg.indexOf("loss much") !== -1) {
        dispatch(
          warmDialog({
            open: true,
            type: "error",
            message: "Failed to withdraw, please increase the Max Loss!",
          }),
        )
      } else if (
        errorMsg.endsWith("'Return amount is not enough'") ||
        errorMsg.endsWith("'callBytes failed: Error(Uniswap: INSUFFICIENT_OUTPUT_AMOUNT)'") ||
        errorMsg.endsWith("'1inch V4 swap failed: Error(Min return not reached)'") ||
        errorMsg.endsWith("'callBytes failed: Error(Received amount of tokens are less then expected)'") ||
        errorMsg.endsWith("'1inch V4 swap failed: Error(Return amount is not enough)'") ||
        errorMsg.endsWith("'Received amount of tokens are less then expected'") ||
        errorMsg.endsWith("Error: VM Exception while processing transaction: reverted with reason string 'OL'")
      ) {
        dispatch(
          warmDialog({
            open: true,
            type: "error",
            message: "Failed to exchange, please increase the exchange slippage or close exchange!",
          }),
        )
      } else {
        dispatch(
          warmDialog({
            open: true,
            type: "error",
            message: errorMsg,
          }),
        )
      }
      setEstimateWithdrawArray(undefined)
    } finally {
      setTimeout(() => {
        setIsEstimate(false)
      }, 1000)
    }
  }, 1000)

  const withdraw = async () => {
    let withdrawTimeStart = Date.now(),
      withdrawValidFinish = 0,
      preWithdrawGetCoins = 0,
      getSwapInfoFinish = 0,
      estimateGasFinish = 0,
      withdrawFinish = 0,
      withdrawTransationFinish = 0
    setIsWithdrawLoading(true)
    console.log("----------start withdraw----------")
    if (!isValidToValue()) {
      return setWithdrawError({
        type: "warning",
        message: "Please enter the correct value.",
      })
    }

    if (!isValidAllowLoss()) {
      return setWithdrawError({
        type: "warning",
        message: "Enter the correct Max Loss value.",
      })
    }

    if (shouldExchange && !isValidSlipper()) {
      return setWithdrawError({
        type: "warning",
        message: "Please enter the correct slippage value.",
      })
    }
    withdrawValidFinish = Date.now()
    setCurrentStep(1)
    const signer = userProvider.getSigner()
    const nextValue = BigNumber.from(
      BN(toValue)
        .multipliedBy(
          BigNumber.from(10)
            .pow(usdiDecimals)
            .toString(),
        )
        .toFixed(),
    )
    const allowMaxLossValue = BigNumber.from(10000 - parseInt(100 * parseFloat(allowMaxLoss))).mul(nextValue).div(BigNumber.from(1e5))
    try {
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const vaultContractWithSigner = vaultContract.connect(signer)
      let exchangeArray = []
      // 如果不需要兑换则按照多币返回
      if (shouldExchange) {
        console.log("----------start callStatic withdraw----------", nextValue, allowMaxLossValue)

        const [tokens, amounts] = await vaultContractWithSigner.callStatic.burn(
          nextValue,
          token,
          allowMaxLossValue,
          false,
          [],
        )

        console.log("tokens, amounts=", tokens, amounts)
        preWithdrawGetCoins = Date.now()
        setCurrentStep(2)
        const exchangeManager = await vaultContract.exchangeManager()
        const exchangeManagerContract = new ethers.Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
        const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract)
        // 查询兑换路径
        exchangeArray = await Promise.all(
          map(tokens, async (tokenItem, index) => {
            const exchangeAmounts = amounts[index].toString()
            if (tokenItem === token || exchangeAmounts === "0") {
              return {}
            }
            const fromConstrat = new ethers.Contract(tokenItem, IERC20_ABI, userProvider)
            const toTokenConstrat = new ethers.Contract(token, IERC20_ABI, userProvider)
            const fromToken = {
              decimals: parseInt((await fromConstrat.decimals()).toString()),
              symbol: await fromConstrat.symbol(),
              address: tokenItem,
            }
            try {
              const bestSwapInfo = await getBestSwapInfo(
                fromToken,
                {
                  decimals: parseInt((await toTokenConstrat.decimals()).toString()),
                  address: token,
                },
                amounts[index].toString(),
                parseInt(100 * parseFloat(slipper)) || 0,
                ORACLE_ADDITIONAL_SLIPPAGE,
                exchangePlatformAdapters,
                EXCHANGE_EXTRA_PARAMS,
              )
              if (isEmpty(bestSwapInfo)) {
                throw new Error("兑换路径获取失败")
              }
              return {
                fromToken: tokenItem,
                toToken: token,
                fromAmount: exchangeAmounts,
                exchangeParam: bestSwapInfo,
              }
            } catch (error) {
              return
            }
          }),
        )
      }
      console.log("exchangeArray=", exchangeArray)
      if (some(exchangeArray, isUndefined)) {
        return setWithdrawError({
          type: "error",
          message: "Failed to fetch the exchange path. Please cancel the exchange or try again later.",
        })
      }
      getSwapInfoFinish = Date.now()
      setCurrentStep(3)
      const nextArray = filter(exchangeArray, i => !isEmpty(i))
      console.log("nextArray=", nextArray)
      let tx
      // gasLimit如果需要配置倍数的话，则需要estimateGas一下
      if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
        const gas = await vaultContractWithSigner.estimateGas.burn(nextValue, token, allowMaxLossValue, true, nextArray)
        setCurrentStep(4)
        estimateGasFinish = Date.now()
        const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
        // 乘以倍数后，如果大于3千万gas，则按3千万执行
        const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
        tx = await vaultContractWithSigner.burn(nextValue, token, allowMaxLossValue, true, nextArray, {
          gasLimit: maxGasLimit,
        })
      } else {
        tx = await vaultContractWithSigner.burn(nextValue, token, allowMaxLossValue, true, nextArray)
      }
      withdrawFinish = Date.now()

      await tx.wait()

      withdrawTransationFinish = Date.now()
      setCurrentStep(5)
      setToValue("")
      dispatch(
        warmDialog({
          open: true,
          type: "success",
          message: "Success!",
        }),
      )
    } catch (error) {
      console.log("withdraw original error :", error)
      let errorMsg = error.toString()
      if (error?.message) {
        errorMsg = error.message
      }
      if (error?.data?.message) {
        errorMsg = error.data.message
      }
      if (error?.error?.data?.originalError?.message) {
        errorMsg = error.error.data.originalError.message
      }
      if (errorMsg.endsWith("'ES or AD'")) {
        dispatch(
          warmDialog({
            open: true,
            type: "error",
            message: "Vault has been shut down, please try again later!",
          }),
        )
      } else if (errorMsg.endsWith("'loss much'") || errorMsg.indexOf("loss much") !== -1) {
        dispatch(
          warmDialog({
            open: true,
            type: "error",
            message: "Failed to withdraw, please increase the Max Loss!",
          }),
        )
      } else if (
        errorMsg.endsWith("'Return amount is not enough'") ||
        errorMsg.endsWith("'callBytes failed: Error(Uniswap: INSUFFICIENT_OUTPUT_AMOUNT)'") ||
        errorMsg.endsWith("'1inch V4 swap failed: Error(Min return not reached)'") ||
        errorMsg.endsWith("'callBytes failed: Error(Received amount of tokens are less then expected)'") ||
        errorMsg.endsWith("'1inch V4 swap failed: Error(Return amount is not enough)'") ||
        errorMsg.endsWith("'Received amount of tokens are less then expected'") ||
        errorMsg.endsWith("Error: VM Exception while processing transaction: reverted with reason string 'OL'")
      ) {
        dispatch(
          warmDialog({
            open: true,
            type: "error",
            message: "Failed to exchange, please increase the exchange slippage or close exchange!",
          }),
        )
      } else {
        dispatch(
          warmDialog({
            open: true,
            type: "error",
            message: errorMsg,
          }),
        )
      }
    }
    setTimeout(() => {
      setIsWithdrawLoading(false)
      setWithdrawError({})
      setCurrentStep(0)
    }, 2000)
    // 最后输出一下withdraw总耗时
    const totalTime = withdrawTransationFinish - withdrawTimeStart
    const szjy = withdrawValidFinish - withdrawTimeStart
    const szjyPercents = ((100 * szjy) / totalTime).toFixed(2)
    const ytq = preWithdrawGetCoins === 0 ? 0 : preWithdrawGetCoins - withdrawValidFinish
    const ytqPercents = ((100 * ytq) / totalTime).toFixed(2)
    const hqdhlj =
      preWithdrawGetCoins === 0 ? getSwapInfoFinish - withdrawValidFinish : getSwapInfoFinish - preWithdrawGetCoins
    const hqdhljPercents = ((100 * hqdhlj) / totalTime).toFixed(2)
    const eg = estimateGasFinish === 0 ? 0 : estimateGasFinish - getSwapInfoFinish
    const egPercents = ((100 * eg) / totalTime).toFixed(2)
    const qk = estimateGasFinish === 0 ? withdrawFinish - getSwapInfoFinish : withdrawFinish - estimateGasFinish
    const qkPercents = ((100 * qk) / totalTime).toFixed(2)
    const swc = withdrawTransationFinish - withdrawFinish
    const swcPercents = ((100 * swc) / totalTime).toFixed(2)
    console.table({
      数值校验: `${szjy}(${szjyPercents}%)`,
      预提取获取币种及数量: `${ytq}(${ytqPercents}%)`,
      查询兑换路径: `${hqdhlj}(${hqdhljPercents}%)`,
      estimateGas: `${eg}(${egPercents}%)`,
      取款: `${qk}(${qkPercents}%)`,
      事务确认: `${swc}(${swcPercents}%)`,
    })
  }

  const addToken = async token => {
    try {
      const tokenContract = new ethers.Contract(token, IERC20_ABI, userProvider)
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: token, // The address that the token is at.
            symbol: await tokenContract.symbol(), // A ticker symbol or shorthand, up to 5 chars.
            decimals: await tokenContract.decimals(), // The number of decimals in the token
          },
        },
      })

      if (wasAdded) {
        console.log("Thanks for your interest!")
      } else {
        console.log("Your loss!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  function imgError (e) {
    const evn = e
    const img = evn.srcElement ? evn.srcElement : evn.target
    img.src = "/default.png"
  }

  const handleTokenChange = (value) => {
    setToken(value);
  }

  const getValuePercent = (balance, percent) => {
    return Math.floor(parseFloat(toFixed(balance, BigNumber.from(10).pow(usdiDecimals))) * percent * 1000000) / 1000000
  }

  const handleWithdrawQuickInput = (ratio) => {
    setToValue(getValuePercent(toBalance, ratio).toString())
  }

  /**
   * 校验toValue是否为有效输入
   * @returns
   */
   const isValidToValue = () => {
    if (toValue === "" || toValue === "-") return
    // 如果不是一个数值
    if (isNaN(Number(toValue))) return false
    const nextValue = BN(toValue)
    const nextToValue = nextValue.multipliedBy(
      BigNumber.from(10)
        .pow(usdtDecimals)
        .toString(),
    )
    // 判断值为正数
    if (nextToValue.lte(0)) return false
      // 精度处理完之后，应该为整数
    const nextToValueString = nextValue.multipliedBy(
      BigNumber.from(10)
        .pow(6)
        .toString(),
    )
    if (nextToValueString.toFixed().indexOf(".") !== -1) return false
    // 数值小于最大数量
    if (toBalance.lt(BigNumber.from(nextToValue.toFixed()))) return false
    return true
  }

  /**
   * 校验allow loss是否为有效输入
   * @returns
   */
  const isValidAllowLoss = () => {
    if (allowMaxLoss === "") return
    if (isNaN(allowMaxLoss)) return false
    if (allowMaxLoss < 0 || allowMaxLoss > 50) return false
    return true
  }

  const isValidSlipper = () => {
    if (slipper === "") return
    if (isNaN(slipper)) return false
    if (slipper < 0 || slipper > 45) return false
    return true
  }

  useEffect(() => {
    // 未打开高级选项页面，则不继续数值预估
    // 如果输入的slipper等值不正确，则不继续数值预估
    if (isOpenEstimate && isValidAllowLoss() && isValidSlipper() && isValidToValue()){
      estimateWithdraw()
    }
    if (isEmpty(toValue)) {
      setEstimateWithdrawArray([])
    }
    return () => estimateWithdraw.cancel()
    // eslint-disable-next-line
  }, [toValue, allowMaxLoss, slipper, shouldExchange, isOpenEstimate, token])

  const handleAmountChange = (event) => {
    try {
      setToValue(event.target.value)
    } catch (error) {
      setToValue("")
    }
  }

  const renderEstimate = () => {
    if (isEstimate) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div style={{ textAlign: "center", padding: "35px 0 25px" }}>
            <CircularProgress fontSize='large' color='primary' />
          </div>
        </GridItem>
      )
    }
    if (isUndefined(estimateWithdrawArray)) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div style={{ textAlign: "center", minHeight: "100px", color: "#fff", padding: "35px 0 25px" }}>
            <ErrorOutlineIcon fontSize='large' />
            <p>Amount estimate failed, please try again!</p>
          </div>
        </GridItem>
      )
    }
    if (isEmpty(estimateWithdrawArray) || isEmpty(toValue)) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div style={{ textAlign: "center", minHeight: "100px", color: "#fff", padding: "35px 0 25px" }}>
            <AndroidIcon fontSize='large' />
            <p style={{ marginTop: 0, letterSpacing: "0.01071em" }}>No estimated value available</p>
          </div>
        </GridItem>
      )
    }
    return map(estimateWithdrawArray, item => {
      return (
        <GridItem key={item.tokenAddress} xs={12} sm={12} md={6} lg={6}>
          <Button
            title='Add token address to wallet'
            color='transparent'
            target='_blank'
            style={{ fontSize: 14, paddingBottom: 20 }}
            onClick={() => addToken(item.tokenAddress)}
          >
            <AddIcon fontSize='small' style={{ position: "absolute", top: 25, left: 45 }} />
            <img className={classes.img} style={{ borderRadius: '50%' }} alt='' src={`./images/${item.tokenAddress}.png`} onError={imgError} />
            &nbsp;&nbsp;~&nbsp;{toFixed(item.amounts, BigNumber.from(10).pow(item.decimals), 6)}
          </Button>
        </GridItem>
      )
    })
  }

  const SettingIcon = isOpenEstimate ? CropIcon : CropFreeIcon
  const selectOptions = [{
    label: 'USDT',
    value: USDT_ADDRESS,
    img: `./images/${USDT_ADDRESS}.png`
  }, {
    label: 'USDC',
    value: USDC_ADDRESS,
    img: `./images/${USDC_ADDRESS}.png`
  }, 
  {
    label: 'DAI',
    value: DAI_ADDRESS,
    img: `./images/${DAI_ADDRESS}.png`
  }]

  const isValidToValueFlag = isValidToValue()
  const isValidAllowLossFlag = isValidAllowLoss()
  const isValidSlipperFlag = isValidSlipper()

  const isLogin = !isEmpty(userProvider)

  return (
    <>
      <GridContainer classes={{ root: classes.withdrawContainer }}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.inputLabelWrapper}>
            <SimpleSelect
              value={token}
              onChange={handleTokenChange}
              options={selectOptions}
            />
            <Muted>
              <CountTo
                from={Number(beforePerFullShare.toBigInt())}
                to={Number(perFullShare.toBigInt())}
                speed={3500}
              >
                {v =>
                  `Shares: ${toFixed(toBalance, BigNumber.from(10).pow(usdiDecimals), 6)}`
                }
              </CountTo>
            </Muted>
          </div>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <CustomTextField
            value={toValue}
            placeholder="withdraw amount"
            onChange={handleAmountChange}
            error={!isUndefined(isValidToValueFlag) && !isValidToValueFlag && (toValue !== '0')}
          />
          <div className={classes.selectorWrapper}>
            <ButtonSelector onClick={handleWithdrawQuickInput} />
          </div>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.withdrawComfirmArea}>
            <div className={classes.settingBtn} style={{ color: isOpenEstimate ? '#39d0d8' : '#da2eef' }}>
              <SettingIcon
                fontSize='large'
                style={{ float: "right", cursor: "pointer" }}
                onClick={() => setIsOpenEstimate(!isOpenEstimate)}
              ></SettingIcon>
              <span style={{ cursor: "pointer" }} onClick={() => setIsOpenEstimate(!isOpenEstimate)}>
                Advanced Settings
              </span>
            </div>
            <Button
              disabled={isLogin && (
                isUndefined(isValidToValueFlag) || !isValidToValueFlag
              )}
              color='colorfull'
              onClick={isLogin ? withdraw : onConnect}
              style={{ minWidth: 122, padding: "12px 16px" }}
            >
              {isLogin ? "Withdraw" : "Connect Wallet"}
            </Button>
          </div>
        </GridItem>
        {isOpenEstimate && (
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12} lg={12} style={{ padding: "24px 0px 16px 15px" }}>
                <span
                  title='Withdrawal tokens and estimated amount'
                  className={classes.settingTitle}
                >
                  Withdrawal tokens and estimated amount
                </span>
              </GridItem>
              <GridItem className={classes.settingItem} xs={12} sm={12} md={12} lg={12}>
                <FormControlLabel
                  labelPlacement='start'
                  control={
                    <CustomInput
                      inputProps={{
                        placeholder: "Allow loss percent",
                        value: allowMaxLoss,
                        endAdornment: (
                          <span style={{ color: "#69c0ff" }}>
                            %&nbsp;&nbsp;&nbsp;
                            <span style={{ cursor: "pointer" }} onClick={() => setAllowMaxLoss(50)}>
                              Max
                            </span>
                          </span>
                        ),
                        onChange: event => {
                          const value = event.target.value
                          setAllowMaxLoss(value)
                        },
                      }}
                      error={!isUndefined(isValidAllowLossFlag) && !isValidAllowLossFlag}
                      success={!isUndefined(isValidAllowLossFlag) && isValidAllowLossFlag}
                      formControlProps={{
                        fullWidth: true,
                        classes: {
                          root: classes.maxLossFormCtrl
                        }
                      }}
                    />
                  }
                  style={{ marginLeft: 0 }}
                  label={
                    <div className={classes.settingItemLabel}>
                      <Muted>Max Loss:</Muted>
                    </div>
                  }
                />
              </GridItem>
              <GridItem className={classes.settingItem} xs={12} sm={12} md={12} lg={12}>
                <FormControlLabel
                  labelPlacement='start'
                  control={
                    <Switch
                      color='default'
                      checked={shouldExchange}
                      onChange={event => setShouldExchange(event.target.checked)}
                      classes={{
                        switchBase: classes.switchBase,
                        checked: classes.switchChecked,
                        thumb: classes.switchIcon,
                        track: classes.switchBar,
                      }}
                    />
                  }
                  style={{ marginLeft: 0 }}
                  label={
                    <div className={classes.settingItemLabel}>
                      <Muted className={classes.exchanged}>
                        <Tooltip
                          classes={{
                            tooltip: classes.tooltip
                          }}
                          placement='top'
                          title='Please pre-set the acceptable exchange loss when the exchange is enabled'
                        >
                          <InfoIcon classes={{ root: classes.labelToolTipIcon }} />
                        </Tooltip>
                        Exchanged:
                      </Muted>
                    </div>
                  }
                />
              </GridItem>
              {shouldExchange && (
                <GridItem className={classNames(classes.settingItem, classes.slippageItem)} xs={12} sm={12} md={12} lg={12}>
                  <FormControlLabel
                    labelPlacement='start'
                    control={
                      <RadioGroup
                        row
                        value={slipper}
                        onChange={event => setSlipper(event.target.value)}
                      >
                        {map(["0.3", "0.5", "1"], (value) => (
                          <FormControlLabel
                            key={value}
                            value={value}
                            style={{ color: "#fff" }}
                            control={<CustomRadio size="small" style={{ padding: 6 }} />}
                            label={`${value}%`}
                          />
                        ))}
                      </RadioGroup>
                    }
                    style={{ marginLeft: 0 }}
                    label={
                      <div className={classes.settingItemLabel}>
                        <Muted>Slippage:</Muted>
                      </div>
                    }
                  />
                  <CustomInput
                    inputProps={{
                      placeholder: "Allow loss percent",
                      value: slipper,
                      endAdornment: (
                        <span style={{ color: "#69c0ff" }}>
                          %&nbsp;&nbsp;&nbsp;
                          <span style={{ cursor: "pointer" }} onClick={() => setSlipper("45")}>
                            Max
                          </span>
                        </span>
                      ),
                      onChange: event => {
                        const value = event.target.value
                        setSlipper(value)
                      },
                    }}
                    error={!isUndefined(isValidSlipperFlag) && !isValidSlipperFlag}
                    success={!isUndefined(isValidSlipperFlag) && isValidSlipperFlag}
                    formControlProps={{
                      fullWidth: true,
                      classes: {
                        root: classes.slippageInput
                      }
                    }}
                  />
                </GridItem>
              )}
              {renderEstimate()}
            </GridContainer>
          </GridItem>
        )}
      </GridContainer>
      <Modal
        className={classes.modal}
        open={isWithdrawLoading}
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
      >
        <Paper
          elevation={3}
          className={classes.widthdrawLoadingPaper}
        >
          <div className={classes.modalBody}>
            {isEmpty(withdrawError) && <CircularProgress color='inherit' />}
            {isEmpty(withdrawError) ? <p>In Withdrawing...</p> : <p>Withdraw Error !</p>}
            <BocStepper
              classes={{
                root: classes.root,
              }}
              alternativeLabel
              activeStep={currentStep}
              connector={<BocStepConnector />}
            >
              {map(steps, (i, index) => {
                return (
                  <Step key={index}>
                    <BocStepLabel StepIconComponent={BocStepIcon}>{i.title}</BocStepLabel>
                  </Step>
                )
              })}
            </BocStepper>
            {!isEmpty(withdrawError) && (
              <p style={{ color: withdrawError.type === "error" ? "red" : "yellow" }}>
                <WarningIcon style={{ verticalAlign: "bottom" }}></WarningIcon>&nbsp;&nbsp;&nbsp;{withdrawError.message}
              </p>
            )}
            <p>
              <Button
                color='danger'
                onClick={() => {
                  setIsWithdrawLoading(false)
                  setWithdrawError({})
                  setCurrentStep(0)
                }}
              >
                Cancel
              </Button>
            </p>
          </div>
        </Paper>
      </Modal>
    </>
  )
}
