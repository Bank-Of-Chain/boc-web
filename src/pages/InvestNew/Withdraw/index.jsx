import React, { useState, useEffect } from "react"
import * as ethers from "ethers"
import BN from "bignumber.js"
import classNames from "classnames"
import { useDispatch } from "react-redux"
import { makeStyles } from "@material-ui/core/styles"

// === Components === //
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
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Typography from "@material-ui/core/Typography"

import SimpleSelect from "../../../components/SimpleSelect"
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
import { addToken } from "../../../helpers/wallet"
import {
  USDT_ADDRESS,
  USDC_ADDRESS,
  DAI_ADDRESS,
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

const RECEIVE_MIX_VALUE = "Mix"

export default function Withdraw ({
  toBalance,
  usdiDecimals,
  userProvider,
  VAULT_ADDRESS,
  VAULT_ABI,
  IERC20_ABI,
  EXCHANGE_AGGREGATOR_ABI,
  EXCHANGE_ADAPTER_ABI,
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [receiveToken, setReceiveToken] = useState(USDT_ADDRESS || "USDT")
  const [toValue, setToValue] = useState("")
  const [allowMaxLoss, setAllowMaxLoss] = useState("0.3")
  const [slipper, setSlipper] = useState("0.3")
  const [estimateWithdrawArray, setEstimateWithdrawArray] = useState([])
  const [isEstimate, setIsEstimate] = useState(false)
  const [isOpenEstimate, setIsOpenEstimate] = useState(true)
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [withdrawError, setWithdrawError] = useState({})

  const { value: redeemFeeBps } = useRedeemFeeBps({
    userProvider,
    VAULT_ADDRESS,
    VAULT_ABI,
  })

  const redeemFeeBpsPercent = redeemFeeBps.toNumber() / 100

  const shouldExchange = receiveToken !== RECEIVE_MIX_VALUE
  const token = shouldExchange ? receiveToken : USDT_ADDRESS

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
            .pow(usdiDecimals)
            .toString(),
        )
        .toFixed(),
    )
    const allowMaxLossValue = BigNumber.from(10000 - parseInt(100 * (parseFloat(allowMaxLoss) + redeemFeeBpsPercent)))
      .mul(nextValue)
      .div(BigNumber.from(1e4))
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
      console.log(
        "tokens, amounts=",
        tokens,
        map(amounts, i => i.toString()),
      )
      if (shouldExchange) {
        const exchangeManager = await vaultContract.exchangeManager()
        const exchangeManagerContract = new ethers.Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
        const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract, userProvider)
        // 查询兑换路径
        let exchangeArray = await Promise.all(
          map(tokens, async (tokenItem, index) => {
            const exchangeAmounts = amounts[index].toString()
            if (tokenItem === token || exchangeAmounts === "0") {
              return {}
            }
            const fromConstrat = new ethers.Contract(tokenItem, IERC20_ABI, userProvider)
            const fromDecimal = await fromConstrat.decimals()
            if (
              BigNumber.from(10)
                .pow(fromDecimal)
                .gt(exchangeAmounts)
            ) {
              // if amount less then 1, do not exchange. Keep fromToken and toToken same, exchange just need a fixed value
              // TODO: 小额不兑换，由于合约端暂未调整，所以v1.5.8版本该功能暂时不上，2022-05-31
              return {
                // fromAmount: exchangeAmounts,
                // fromToken: tokenItem,
                // toToken: tokenItem,
                // exchangeParam: {
                //   encodeExchangeArgs: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000029c54a1016ca4e51f0000000000000000000000000000000000000000000000029a5359ddd60bd3060000000000000000000000000000000000000000000000029c54a1016ca4e51f00000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000002e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000050494747590100000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000032000000000000000000000000000000000000000000000000000000000627eb8b8f583eed0d2c411ec918c2bb862191012000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000000000000242e1a7d4d0000000000000000000000000000000000000000000000029c54a1016ca4e51f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                //   method: 0,
                //   name: "paraswap",
                //   oracleAdditionalSlippage: 0,
                //   platform: "0x5133BBdfCCa3Eb4F739D599ee4eC45cBCD0E16c5",
                //   slippage: 0,
                // }
              }
            }
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
              message: "Failed to fetch the exchange path. Please try again later or choose mixed token",
            }),
          )
          return
        }
        console.log("exchangeArray=", exchangeArray)
        const nextArray = filter(exchangeArray, i => !isEmpty(i))
        ;[tokens, amounts] = await vaultContractWithSigner.callStatic.burn(
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
      if (error?.error?.data?.message) {
        errorMsg = error.error.data.message
      }
      let tip = ""
      if (errorMsg.endsWith("'ES or AD'") || errorMsg.endsWith("'ES'")) {
        tip = "Vault has been shut down, please try again later!"
      } else if (errorMsg.endsWith("'AD'")) {
        tip = "Vault is in adjustment status, please try again later!"
      } else if (errorMsg.endsWith("'RP'")) {
        tip = "Vault is in rebase status, please try again later!"
      } else if (errorMsg.indexOf("loss much") !== -1 || errorMsg.indexOf("amount lower than minimum") !== -1) {
        tip = "Failed to withdraw, please increase the Max Loss!"
      } else if (
        errorMsg.endsWith("'Return amount is not enough'") ||
        errorMsg.endsWith("'callBytes failed: Error(Uniswap: INSUFFICIENT_OUTPUT_AMOUNT)'") ||
        errorMsg.endsWith("'callBytes failed: Error(UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT)'") ||
        errorMsg.endsWith("'1inch V4 swap failed: Error(Min return not reached)'") ||
        errorMsg.endsWith("'callBytes failed: Error(Received amount of tokens are less then expected)'") ||
        errorMsg.endsWith("'1inch V4 swap failed: Error(Return amount is not enough)'") ||
        errorMsg.endsWith("'Received amount of tokens are less then expected'") ||
        errorMsg.endsWith("Error: VM Exception while processing transaction: reverted with reason string 'OL'")
      ) {
        tip = "Failed to exchange, please increase the exchange slippage or choose mixed token!"
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
    const allowMaxLossValue = BigNumber.from(10000 - parseInt(100 * (parseFloat(allowMaxLoss) + redeemFeeBpsPercent)))
      .mul(nextValue)
      .div(BigNumber.from(1e4))
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

        console.log(
          "tokens, amounts=",
          tokens,
          map(amounts, i => i.toString()),
        )
        preWithdrawGetCoins = Date.now()
        setCurrentStep(2)
        const exchangeManager = await vaultContract.exchangeManager()
        const exchangeManagerContract = new ethers.Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
        const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract, userProvider)
        // 查询兑换路径
        exchangeArray = await Promise.all(
          map(tokens, async (tokenItem, index) => {
            const exchangeAmounts = amounts[index].toString()
            if (tokenItem === token || exchangeAmounts === "0") {
              return {}
            }
            const fromConstrat = new ethers.Contract(tokenItem, IERC20_ABI, userProvider)
            const toTokenConstrat = new ethers.Contract(token, IERC20_ABI, userProvider)
            const fromDecimal = await fromConstrat.decimals()
            if (
              BigNumber.from(10)
                .pow(fromDecimal)
                .gt(exchangeAmounts)
            ) {
              // if amount less then 1, do not exchange. Keep fromToken and toToken same, exchange just need a fixed value
              // TODO: 小额不兑换，由于合约端暂未调整，所以v1.5.8版本该功能暂时不上，2022-05-31
              return {
                // fromAmount: exchangeAmounts,
                // fromToken: tokenItem,
                // toToken: tokenItem,
                // exchangeParam: {
                //   encodeExchangeArgs: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000029c54a1016ca4e51f0000000000000000000000000000000000000000000000029a5359ddd60bd3060000000000000000000000000000000000000000000000029c54a1016ca4e51f00000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000002e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000050494747590100000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000032000000000000000000000000000000000000000000000000000000000627eb8b8f583eed0d2c411ec918c2bb862191012000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000000000000242e1a7d4d0000000000000000000000000000000000000000000000029c54a1016ca4e51f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                //   method: 0,
                //   name: "paraswap",
                //   oracleAdditionalSlippage: 0,
                //   platform: "0x5133BBdfCCa3Eb4F739D599ee4eC45cBCD0E16c5",
                //   slippage: 0,
                // }
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
          message: "Failed to fetch the exchange path. Please try again later or choose mixed token",
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
          token,
          allowMaxLossValue,
          shouldExchange,
          nextArray,
        )
        setCurrentStep(4)
        estimateGasFinish = Date.now()
        const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
        // 乘以倍数后，如果大于3千万gas，则按3千万执行
        const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
        tx = await vaultContractWithSigner.burn(nextValue, token, allowMaxLossValue, shouldExchange, nextArray, {
          gasLimit: maxGasLimit,
        })
      } else {
        tx = await vaultContractWithSigner.burn(nextValue, token, allowMaxLossValue, shouldExchange, nextArray)
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
      if (error?.error?.data?.message) {
        errorMsg = error.error.data.message
      }
      let tip = ""
      if (errorMsg.endsWith("'ES or AD'") || errorMsg.endsWith("'ES'")) {
        tip = "Vault has been shut down, please try again later!"
      } else if (errorMsg.endsWith("'AD'")) {
        tip = "Vault is in adjustment status, please try again later!"
      } else if (errorMsg.endsWith("'RP'")) {
        tip = "Vault is in rebase status, please try again later!"
      } else if (
        errorMsg.endsWith("'loss much'") ||
        errorMsg.indexOf("loss much") !== -1 ||
        errorMsg.endsWith('"amount lower than minimum"')
      ) {
        tip = "Failed to withdraw, please increase the Max Loss!"
      } else if (
        errorMsg.endsWith("'Return amount is not enough'") ||
        errorMsg.endsWith("'callBytes failed: Error(Uniswap: INSUFFICIENT_OUTPUT_AMOUNT)'") ||
        errorMsg.endsWith("'callBytes failed: Error(UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT)'") ||
        errorMsg.endsWith("'1inch V4 swap failed: Error(Min return not reached)'") ||
        errorMsg.endsWith("'callBytes failed: Error(Received amount of tokens are less then expected)'") ||
        errorMsg.endsWith("'1inch V4 swap failed: Error(Return amount is not enough)'") ||
        errorMsg.endsWith("'Received amount of tokens are less then expected'") ||
        errorMsg.endsWith("Error: VM Exception while processing transaction: reverted with reason string 'OL'")
      ) {
        tip = "Failed to exchange, please increase the exchange slippage or choose mixed token!"
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

  const handleReceiveTokenChange = value => {
    setReceiveToken(value)
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
        .pow(usdiDecimals)
        .toString(),
    )
    // 判断值为正数
    if (nextToValue.lte(0)) return false
    // 精度处理完之后，应该为整数
    const nextToValueString = nextValue.multipliedBy(
      BigNumber.from(10)
        .pow(usdiDecimals)
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
  }, [toValue, allowMaxLoss, slipper, shouldExchange, isOpenEstimate, token])

  const handleAmountChange = event => {
    try {
      setToValue(event.target.value)
    } catch (error) {
      setToValue("")
    }
  }

  const handleMaxClick = () => {
    setToValue(formatBalance(toBalance, usdiDecimals, { showAll: true }))
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
            <img
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
  const selectOptions = [
    {
      label: "USDT",
      value: USDT_ADDRESS || "USDT",
      img: "./images/0x55d398326f99059fF775485246999027B3197955.png",
    },
    {
      label: "USDC",
      value: USDC_ADDRESS || "USDC",
      img: "./images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png",
    },
    {
      label: "DAI",
      value: DAI_ADDRESS || "DAI",
      img: "./images/0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3.png",
    },
    {
      label: "Mix",
      value: RECEIVE_MIX_VALUE || "Mix",
      img: [
        "./images/0x55d398326f99059fF775485246999027B3197955.png",
        "./images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png",
        "./images/0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3.png",
      ],
    },
  ]

  const isValidToValueFlag = isValidToValue()
  const isValidAllowLossFlag = isValidAllowLoss()
  const isValidSlipperFlag = isValidSlipper()

  const isLogin = !isEmpty(userProvider)

  return (
    <>
      <GridContainer className={classes.withdrawContainer}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText}>From</p>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.inputLabelWrapper}>
            <div className={classes.tokenInfo}>
              <span className={classes.tokenName}>USDi</span>
            </div>
            <CustomTextField
              classes={{ root: classes.input }}
              value={toValue}
              placeholder='withdraw amount'
              maxEndAdornment
              onMaxClick={() => handleMaxClick()}
              onChange={handleAmountChange}
              error={!isUndefined(isValidToValueFlag) && !isValidToValueFlag && toValue !== "0"}
            />
          </div>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText}>Balance: 1231232.1232</p>
        </GridItem>
      </GridContainer>
      <GridContainer className={classes.outputContainer}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText}>To</p>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.selectorlWrapper}>
            <SimpleSelect value={receiveToken} onChange={handleReceiveTokenChange} options={selectOptions} />
            <p className={classes.estimateText}>0</p>
          </div>

          {receiveToken === "Mix" && (
            <Tooltip
              classes={{
                tooltip: classes.tooltip,
              }}
              placement='top'
              title={
                "Mix mode will return a variety of coins, such as USDT/USDC/TUSD/BUSD, etc. You can view the estimated currency and quantity in Advanced Setting"
              }
            >
              <InfoIcon style={{ fontSize: 16 }} />
            </Tooltip>
          )}
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText}>Balance: 0</p>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.footerContainer}>
            <Button
              disabled={!isLogin || (isLogin && (isUndefined(isValidToValueFlag) || !isValidToValueFlag))}
              color='colorfull'
              onClick={withdraw}
              style={{ width: "100%", padding: "12px 16px" }}
            >
              Withdraw
              <Tooltip
                classes={{
                  tooltip: classes.tooltip,
                }}
                placement='top'
                title={`${redeemFeeBpsPercent}% withdrawal fee of the principal.`}
              >
                <InfoIcon classes={{ root: classes.labelToolTipIcon }} style={{ right: "-5px", left: "auto" }} />
              </Tooltip>
            </Button>
          </div>
        </GridItem>
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
