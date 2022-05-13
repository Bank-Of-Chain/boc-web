import React, { useState, useEffect } from "react"
import * as ethers from "ethers"
import BN from "bignumber.js"
import classNames from "classnames"
import { useDispatch } from "react-redux"
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
import Step from "@material-ui/core/Step"
import WarningIcon from "@material-ui/icons/Warning"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Tooltip from "@material-ui/core/Tooltip"
import InfoIcon from "@material-ui/icons/Info"

import CustomTextField from "../../../components/CustomTextField"
import BocStepper from "../../../components/Stepper/Stepper"
import BocStepLabel from "../../../components/Stepper/StepLabel"
import BocStepIcon from "../../../components/Stepper/StepIcon"
import BocStepConnector from "../../../components/Stepper/StepConnector"
import CustomRadio from "./../../../components/Radio/Radio"
import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"
import Muted from "../../../components/Typography/Muted"
import Button from "../../../components/CustomButtons/Button"
import CustomInput from "../../../components/CustomInput/CustomInput"
import { warmDialog } from "./../../../reducers/meta-reducer"
import { toFixed, formatBalance } from "../../../helpers/number-format"
import {
  EXCHANGE_EXTRA_PARAMS,
  MULTIPLE_OF_GAS,
  MAX_GAS_LIMIT,
  ORACLE_ADDITIONAL_SLIPPAGE,
} from "../../../constants"

// === Hooks === //
import useRedeemFeeBps from "../../../hooks/useRedeemFeeBps"

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

export default function Withdraw ({
  ethiBalance,
  ethiDecimals,
  userProvider,
  onConnect,
  ETH_ADDRESS,
  VAULT_ADDRESS,
  VAULT_ABI,
  IERC20_ABI,
  EXCHANGE_AGGREGATOR_ABI,
  EXCHANGE_ADAPTER_ABI,
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [toValue, setToValue] = useState("")
  const [allowMaxLoss, setAllowMaxLoss] = useState("0.3")
  const [slipper, setSlipper] = useState("0.3")
  const [estimateWithdrawArray, setEstimateWithdrawArray] = useState([])
  const [isEstimate, setIsEstimate] = useState(false)
  const [isOpenEstimate, setIsOpenEstimate] = useState(false)
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [withdrawError, setWithdrawError] = useState({})

  const { value: redeemFeeBps } = useRedeemFeeBps({
    userProvider,
    VAULT_ADDRESS,
    VAULT_ABI
  })

  const redeemFeeBpsPercent = redeemFeeBps.toNumber() / 100

  const getExchangePlatformAdapters = async (exchangeAggregator, userProvider) => {
    const adapters = await exchangeAggregator.getExchangeAdapters()
    const exchangePlatformAdapters = {}
    for (const address of adapters) {
      const contract = new ethers.Contract(address, EXCHANGE_ADAPTER_ABI, userProvider)
      exchangePlatformAdapters[await contract.identifier()] = address
    }
    return exchangePlatformAdapters
  }

  const estimateWithdraw = debounce(async () => {
    setIsEstimate(true)
    const nextValue = BigNumber.from(
      BN(toValue)
        .multipliedBy(
          BigNumber.from(10)
            .pow(ethiDecimals)
            .toString(),
        )
        .toFixed(),
    )
    const allowMaxLossValue = BigNumber.from(10000 - parseInt(100 * parseFloat(allowMaxLoss)))
      .mul(nextValue)
      .div(BigNumber.from(1e4))
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const signer = userProvider.getSigner()
    const vaultContractWithSigner = vaultContract.connect(signer)

    try {
      let [tokens, amounts] = await vaultContractWithSigner.callStatic.burn(
        nextValue,
        ETH_ADDRESS,
        allowMaxLossValue,
        false,
        [],
      )
      const exchangeManager = await vaultContract.exchangeManager()
      const exchangeManagerContract = new ethers.Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
      const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract, userProvider)
      console.log("estimate get exchange path:", tokens, map(amounts, i => i.toString()))
      // 查询兑换路径
      let exchangeArray = await Promise.all(
        map(tokens, async (tokenItem, index) => {
          const exchangeAmounts = amounts[index].toString()
          if (tokenItem === ETH_ADDRESS || exchangeAmounts === "0") {
            return {}
          }
          const fromConstrat = new ethers.Contract(tokenItem, IERC20_ABI, userProvider)
          const fromDecimal = await fromConstrat.decimals()
          if(BigNumber.from(10).pow(fromDecimal).gt(exchangeAmounts)) {
            //TODO: 理论上这里面，不进行兑换即可，但是目前vault不支持
            return {
              fromAmount: exchangeAmounts,
              fromToken: tokenItem,
              toToken: tokenItem,
              exchangeParam: {
                encodeExchangeArgs: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000029c54a1016ca4e51f0000000000000000000000000000000000000000000000029a5359ddd60bd3060000000000000000000000000000000000000000000000029c54a1016ca4e51f00000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000002e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000050494747590100000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000032000000000000000000000000000000000000000000000000000000000627eb8b8f583eed0d2c411ec918c2bb862191012000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000000000000242e1a7d4d0000000000000000000000000000000000000000000000029c54a1016ca4e51f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                method: 0,
                name: "paraswap",
                oracleAdditionalSlippage: 0,
                platform: "0x5133BBdfCCa3Eb4F739D599ee4eC45cBCD0E16c5",
                slippage: 0,
              }
            }
          }
          const fromToken = {
            decimals: parseInt((await fromConstrat.decimals()).toString()),
            symbol: await fromConstrat.symbol(),
            address: tokenItem,
          }
          try {
            const bestSwapInfo = await getBestSwapInfo(
              fromToken,
              {
                decimals: 18,
                address: ETH_ADDRESS,
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
              toToken: ETH_ADDRESS,
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
            message: "Failed to fetch the exchange path. Please try again later.",
          }),
        )
        return
      }
      console.log("exchangeArray=", exchangeArray)
      const nextArray = filter(exchangeArray, i => !isEmpty(i))
      ;[tokens, amounts] = await vaultContractWithSigner.callStatic.burn(
        nextValue,
        ETH_ADDRESS,
        allowMaxLossValue,
        true,
        nextArray,
      )
      console.log("estimate withdraw result:", tokens, amounts)
      let nextEstimateWithdrawArray = compact(
        await Promise.all(
          map(tokens, async (token, index) => {
            const amount = get(amounts, index, BigNumber.from(0))
            if (amount.gt(0)) {
              return {
                tokenAddress: token,
                decimals: ethiDecimals,
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
      let tip = ""
      if (errorMsg.endsWith("'ES or AD'") || errorMsg.endsWith("'ES'")) {
        tip = "Vault has been shut down, please try again later!"
      } else if (errorMsg.endsWith("'AD'")) {
        tip = "Vault is in adjustment status, please try again later!"
      } else if (errorMsg.endsWith("'RP'")) {
        tip = "Vault is in rebase status, please try again later!"
      } else if (
        errorMsg.indexOf("loss much") !== -1 ||
        errorMsg.indexOf("amount lower than minimum") !== -1
      ) {
        tip = "Failed to withdraw, please increase the Max Loss!"
      } else if (
        errorMsg.endsWith("'Return amount is not enough'") ||
        errorMsg.endsWith("'callBytes failed: Error(Uniswap: INSUFFICIENT_OUTPUT_AMOUNT)'") ||
        errorMsg.endsWith("'1inch V4 swap failed: Error(Min return not reached)'") ||
        errorMsg.endsWith("'callBytes failed: Error(Received amount of tokens are less then expected)'") ||
        errorMsg.endsWith("'1inch V4 swap failed: Error(Return amount is not enough)'") ||
        errorMsg.endsWith("'Received amount of tokens are less then expected'") ||
        errorMsg.endsWith("Error: VM Exception while processing transaction: reverted with reason string 'OL'")
      ) {
        tip = "Failed to exchange, please increase the exchange slippage"
      } else {
        tip = errorMsg
      }
      dispatch(
        warmDialog({
          open: true,
          type: "error",
          message: tip,
        }),
      )
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

    if (!isValidSlipper()) {
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
            .pow(ethiDecimals)
            .toString(),
        )
        .toFixed(),
    )
    const allowMaxLossValue = BigNumber.from(10000 - parseInt(100 * parseFloat(allowMaxLoss)))
      .mul(nextValue)
      .div(BigNumber.from(1e4))
    try {
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const vaultContractWithSigner = vaultContract.connect(signer)
      let exchangeArray = []
      // 如果不需要兑换则按照多币返回
      console.log("----------start callStatic withdraw----------", nextValue, allowMaxLossValue)

      const [tokens, amounts] = await vaultContractWithSigner.callStatic.burn(
        nextValue,
        ETH_ADDRESS,
        allowMaxLossValue,
        false,
        [],
      )

      console.log("tokens, amounts=", tokens, map(amounts, i => i.toString()))
      preWithdrawGetCoins = Date.now()
      setCurrentStep(2)
      const exchangeManager = await vaultContract.exchangeManager()
      const exchangeManagerContract = new ethers.Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
      const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract, userProvider)
      // 查询兑换路径
      exchangeArray = await Promise.all(
        map(tokens, async (tokenItem, index) => {
          const exchangeAmounts = amounts[index].toString()
          if (tokenItem === ETH_ADDRESS || exchangeAmounts === "0") {
            return {}
          }
          const fromConstrat = new ethers.Contract(tokenItem, IERC20_ABI, userProvider)
          // const toTokenConstrat = new ethers.Contract(token, IERC20_ABI, userProvider)
          const fromDecimal = await fromConstrat.decimals()
          if(BigNumber.from(10).pow(fromDecimal).gt(exchangeAmounts)) {
            //TODO: 理论上这里面，不进行兑换即可，但是目前vault不支持
            return {
              fromAmount: exchangeAmounts,
              fromToken: tokenItem,
              toToken: tokenItem,
              exchangeParam: {
                encodeExchangeArgs: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000029c54a1016ca4e51f0000000000000000000000000000000000000000000000029a5359ddd60bd3060000000000000000000000000000000000000000000000029c54a1016ca4e51f00000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000002e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000050494747590100000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000032000000000000000000000000000000000000000000000000000000000627eb8b8f583eed0d2c411ec918c2bb862191012000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000000000000242e1a7d4d0000000000000000000000000000000000000000000000029c54a1016ca4e51f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                method: 0,
                name: "paraswap",
                oracleAdditionalSlippage: 0,
                platform: "0x5133BBdfCCa3Eb4F739D599ee4eC45cBCD0E16c5",
                slippage: 0,
              }
            }
          }
          const fromToken = {
            decimals: parseInt((await fromConstrat.decimals()).toString()),
            symbol: await fromConstrat.symbol(),
            address: tokenItem,
          }
          try {
            const bestSwapInfo = await getBestSwapInfo(
              fromToken,
              {
                decimals: 18,
                address: ETH_ADDRESS,
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
              toToken: ETH_ADDRESS,
              fromAmount: exchangeAmounts,
              exchangeParam: bestSwapInfo,
            }
          } catch (error) {
            return
          }
        }),
      )
      console.log("exchangeArray=", exchangeArray)
      if (some(exchangeArray, isUndefined)) {
        return setWithdrawError({
          type: "error",
          message: "Failed to fetch the exchange path. Please try again later.",
        })
      }
      getSwapInfoFinish = Date.now()
      setCurrentStep(3)
      const nextArray = filter(exchangeArray, i => !isEmpty(i))
      console.log("nextArray=", nextArray)
      let tx
      // gasLimit如果需要配置倍数的话，则需要estimateGas一下
      if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
        const gas = await vaultContractWithSigner.estimateGas.burn(
          nextValue,
          ETH_ADDRESS,
          allowMaxLossValue,
          true,
          nextArray,
        )
        setCurrentStep(4)
        estimateGasFinish = Date.now()
        const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
        // 乘以倍数后，如果大于3千万gas，则按3千万执行
        const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
        tx = await vaultContractWithSigner.burn(nextValue, ETH_ADDRESS, allowMaxLossValue, true, nextArray, {
          gasLimit: maxGasLimit,
        })
      } else {
        tx = await vaultContractWithSigner.burn(nextValue, ETH_ADDRESS, allowMaxLossValue, true, nextArray)
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
      let tip = ""
      if (errorMsg.endsWith("'ES or AD'") || errorMsg.endsWith("'ES'")) {
        tip = "Vault has been shut down, please try again later!"
      } else if (errorMsg.endsWith("'AD'")) {
        tip = "Vault is in adjustment status, please try again later!"
      } else if (errorMsg.endsWith("'RP'")) {
        tip = "Vault is in rebase status, please try again later!"
      } else if (
        errorMsg.indexOf("loss much") !== -1 ||
        errorMsg.indexOf('amount lower than minimum') !== -1
      ) {
        tip = "Failed to withdraw, please increase the Max Loss!"
      } else if (
        errorMsg.endsWith("'Return amount is not enough'") ||
        errorMsg.endsWith("'callBytes failed: Error(Uniswap: INSUFFICIENT_OUTPUT_AMOUNT)'") ||
        errorMsg.endsWith("'1inch V4 swap failed: Error(Min return not reached)'") ||
        errorMsg.endsWith("'callBytes failed: Error(Received amount of tokens are less then expected)'") ||
        errorMsg.endsWith("'1inch V4 swap failed: Error(Return amount is not enough)'") ||
        errorMsg.endsWith("'Received amount of tokens are less then expected'") ||
        errorMsg.endsWith("Error: VM Exception while processing transaction: reverted with reason string 'OL'")
      ) {
        tip = "Failed to exchange, please increase the exchange slippage!"
      } else {
        tip = errorMsg
      }
      dispatch(
        warmDialog({
          open: true,
          type: "error",
          message: tip,
        }),
      )
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

  function imgError (e) {
    const evn = e
    const img = evn.srcElement ? evn.srcElement : evn.target
    img.src = "/default.png"
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
        .pow(ethiDecimals)
        .toString(),
    )
    // 判断值为正数
    if (nextToValue.lte(0)) return false
    // 精度处理完之后，应该为整数
    const nextToValueString = nextValue.multipliedBy(
      BigNumber.from(10)
        .pow(ethiDecimals)
        .toString(),
    )
    if (nextToValueString.toFixed().indexOf(".") !== -1) return false
    // 数值小于最大数量
    if (ethiBalance.lt(BigNumber.from(nextToValue.toFixed()))) return false
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
    if (isOpenEstimate && isValidAllowLoss() && isValidSlipper() && isValidToValue()) {
      estimateWithdraw()
    }
    if (isEmpty(toValue)) {
      setEstimateWithdrawArray([])
    }
    return () => {
      setEstimateWithdrawArray([])
      return estimateWithdraw.cancel()
    }
    // eslint-disable-next-line
  }, [toValue, allowMaxLoss, slipper, isOpenEstimate])

  const handleAmountChange = event => {
    try {
      setToValue(event.target.value)
    } catch (error) {
      setToValue("")
    }
  }

  const handleMaxClick = () => {
    setToValue(formatBalance(ethiBalance, ethiDecimals, { showAll: true }))
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
            title={toFixed(item.amounts, BigNumber.from(10).pow(item.decimals))}
            color='transparent'
            target='_blank'
            style={{ fontSize: 14, paddingBottom: 20 }}
          >
            <AddIcon fontSize='small' style={{ position: "absolute", top: 25, left: 45 }} />
            <img
              title='Add token address to wallet'
              className={classes.img}
              style={{ borderRadius: "50%" }}
              alt=''
              src={`./images/${item.tokenAddress}.png`}
              onError={imgError}
            />
            &nbsp;&nbsp;~&nbsp;{toFixed(item.amounts, BigNumber.from(10).pow(item.decimals), 6)}
          </Button>
        </GridItem>
      )
    })
  }

  const SettingIcon = isOpenEstimate ? CropIcon : CropFreeIcon

  const isValidToValueFlag = isValidToValue()
  const isValidAllowLossFlag = isValidAllowLoss()
  const isValidSlipperFlag = isValidSlipper()

  const isLogin = !isEmpty(userProvider)

  return (
    <>
      <GridContainer classes={{ root: classes.withdrawContainer }}>
        <GridItem xs={12} sm={12} md={12} lg={12} className={classes.withdrawItem}>
          <Muted className={classes.withdrawItemLabel}>ETHi: </Muted>
          <CustomTextField
            value={toValue}
            placeholder='amount'
            maxEndAdornment
            onMaxClick={() => handleMaxClick()}
            onChange={handleAmountChange}
            error={!isUndefined(isValidToValueFlag) && !isValidToValueFlag && toValue !== "0"}
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.withdrawComfirmArea}>
            <div className={classes.settingBtn} style={{ color: isOpenEstimate ? "#39d0d8" : "#da2eef" }}>
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
              disabled={isLogin && (isUndefined(isValidToValueFlag) || !isValidToValueFlag)}
              color='colorfull'
              onClick={isLogin ? withdraw : onConnect}
              style={{ minWidth: 122, padding: "12px 16px" }}
            >
              {isLogin ? "Withdraw" : "Connect Wallet"}
            </Button>
            <Tooltip
              classes={{
                tooltip: classes.tooltip
              }}
              placement='top'
              title={`${redeemFeeBpsPercent}% withdrawal fee of the principal.`}
            >
              <InfoIcon classes={{ root: classes.labelToolTipIcon }} style={{ right: '-5px', left: 'auto' }} />
            </Tooltip>
          </div>
        </GridItem>
        {isOpenEstimate && (
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12} lg={12} style={{ padding: "24px 0px 16px 15px" }}>
                <span title='Withdrawal tokens and estimated amount' className={classes.settingTitle}>
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
                          root: classes.maxLossFormCtrl,
                        },
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
              <GridItem
                className={classNames(classes.settingItem, classes.slippageItem)}
                xs={12}
                sm={12}
                md={12}
                lg={12}
              >
                <FormControlLabel
                  labelPlacement='start'
                  control={
                    <RadioGroup row value={slipper} onChange={event => setSlipper(event.target.value)}>
                      {map(["0.3", "0.5", "1"], value => (
                        <FormControlLabel
                          key={value}
                          value={value}
                          style={{ color: "#fff" }}
                          control={<CustomRadio size='small' style={{ padding: 6 }} />}
                          label={`${value}%`}
                        />
                      ))}
                    </RadioGroup>
                  }
                  style={{ marginLeft: 0 }}
                  label={
                    <div className={classes.settingItemLabel}>
                      <Muted className={classes.mutedLabel}>
                        Slippage:
                      </Muted>
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
                      root: classes.slippageInput,
                    },
                  }}
                />
              </GridItem>
              {renderEstimate()}
            </GridContainer>
          </GridItem>
        )}
        {
          isEmpty(VAULT_ADDRESS) && <GridItem xs={12} sm={12} md={12} lg={12}>
            <p style={{ textAlign:'center', color: 'red' }}>Switch to the ETH chain firstly!</p>
          </GridItem>
        }
      </GridContainer>
      <Modal
        className={classes.modal}
        open={isWithdrawLoading}
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
      >
        <Paper elevation={3} className={classes.widthdrawLoadingPaper}>
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
