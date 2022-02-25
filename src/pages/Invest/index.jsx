import React, { useState, useEffect } from "react"
// nodejs library that concatenates classes
import classNames from "classnames"
// react components for routing our app without refresh
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"
import Switch from "@material-ui/core/Switch"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import CountTo from "react-count-to"
// core components
import GridContainer from "../../components/Grid/GridContainer"
import GridItem from "../../components/Grid/GridItem"
// sections for this page
import CustomInput from "../../components/CustomInput/CustomInput"
import Button from "../../components/CustomButtons/Button"
import Muted from "../../components/Typography/Muted"
import CircularProgress from "@material-ui/core/CircularProgress"
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline"
import AddIcon from "@material-ui/icons/Add"
import AndroidIcon from "@material-ui/icons/Android"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Paper from "@material-ui/core/Paper"
import CropFreeIcon from "@material-ui/icons/CropFree"
import CropIcon from "@material-ui/icons/Crop"
import Card from "@material-ui/core/Card"
import CardHeader from "@material-ui/core/CardHeader"
import RadioGroup from "@material-ui/core/RadioGroup"
import CustomRadio from "./../../components/Radio/Radio"
import Tooltip from "@material-ui/core/Tooltip"
import InfoIcon from "@material-ui/icons/Info"
import Modal from "@material-ui/core/Modal"
import Step from "@material-ui/core/Step"
import BocStepper from "../../components/Stepper/Stepper"
import BocStepLabel from "../../components/Stepper/StepLabel"
import BocStepIcon from "../../components/Stepper/StepIcon"
import BocStepConnector from "../../components/Stepper/StepConnector"
import WarningIcon from "@material-ui/icons/Warning"

import { useDispatch } from "react-redux"

// === Reducers === //
import { warmDialog } from "./../../reducers/meta-reducer"

// === constants === //
import {
  abiPrefix,
  VAULT_ADDRESS,
  VAULT_ABI,
  IERC20_ABI,
  USDT_ADDRESS,
  EXCHANGE_AGGREGATOR_ABI,
  EXCHANGE_EXTRA_PARAMS,
  MULTIPLE_OF_GAS,
  CHAIN_BROWSER_URL,
  MAX_GAS_LIMIT, ORACLE_ADDITIONAL_SLIPPAGE,
} from "../../constants"

// === Utils === //
import { getBestSwapInfo } from "piggy-finance-utils"
import { toFixed } from "../../helpers/number-format"
import map from "lodash/map"
import get from "lodash/get"
import debounce from "lodash/debounce"
import compact from "lodash/compact"
import isEmpty from "lodash/isEmpty"
import some from "lodash/some"
import last from "lodash/last"
import filter from "lodash/filter"
import isUndefined from "lodash/isUndefined"
import noop from "lodash/noop"
import isNumber from "lodash/isNumber"
import pick from "lodash/pick"
import * as ethers from "ethers"
import BN from "bignumber.js"

// === Styles === //
import styles from "./style"

const steps = [
  { title: "Shares Validation" },
  { title: "Pre Withdraw" },
  { title: "Exchange Path Query" },
  { title: "Gas Estimates" },
  { title: "Withdraw" },
]

const useStyles = makeStyles(styles)
const { BigNumber } = ethers

const getExchangePlatformAdapters = async exchangeAggregator => {
  const adapters = await exchangeAggregator.getExchangeAdapters()
  const exchangePlatformAdapters = {}
  for (let i = 0; i < adapters.identifiers_.length; i++) {
    exchangePlatformAdapters[adapters.identifiers_[i]] = adapters.exchangeAdapters_[i]
  }
  return exchangePlatformAdapters
}

export default function Invest (props) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { address, userProvider } = props
  const [usdtDecimals, setUsdtDecimals] = useState(0)
  const [beforeTotalAssets, setBeforeTotalAssets] = useState(BigNumber.from(0))
  const [totalAssets, setTotalAssets] = useState(BigNumber.from(0))

  const [fromValue, setFromValue] = useState("")
  const [toValue, setToValue] = useState("")
  const [fromBalance, setFromBalance] = useState(BigNumber.from(0))
  const [toBalance, setToBalance] = useState(BigNumber.from(0))
  const [beforePerFullShare, setBeforePerFullShare] = useState(BigNumber.from(1))
  const [perFullShare, setPerFullShare] = useState(BigNumber.from(1))

  const [allowMaxLoss, setAllowMaxLoss] = useState("0.3")
  const [slipper, setSlipper] = useState("0.3")
  const [shouldExchange, setShouldExchange] = useState(true)
  const [estimateWithdrawArray, setEstimateWithdrawArray] = useState([])
  const [isEstimate, setIsEstimate] = useState(false)
  const [isOpenEstimate, setIsOpenEstimate] = useState(false)
  const [totalSupply, setTotalSupply] = useState(BigNumber.from(0))

  const [isFromValueMax, setIsFromValueMax] = useState(false)
  const [isToValueMax, setIsToValueMax] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [withdrawError, setWithdrawError] = useState({})
  // 载入账户数据
  const loadBanlance = () => {
    if (isEmpty(address)) return loadBanlance
    const usdtContract = new ethers.Contract(USDT_ADDRESS, IERC20_ABI, userProvider)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)

    Promise.all([
      usdtContract.balanceOf(address).then(setFromBalance),
      vaultContract
        .balanceOf(address)
        .then(setToBalance)
        .catch(noop),
      loadTotalAssets()
        .then(([afterTotalAssets, afterPerFullShare]) => {
          setTotalAssets(afterTotalAssets)
          setPerFullShare(afterPerFullShare)
        })
        .catch(noop),
      // TODO:此处的usdtDecimals较特别为10的幂的数值，主要是因为lend方法里的usdtDecimals取幂操作
      // 其他处的usdtDecimals都是为10**18或10**6
      usdtContract.decimals().then(setUsdtDecimals),
      vaultContract.totalSupply().then(setTotalSupply),
      // vaultContract.token().then(setToken),
      // vaultContract.getTrackedAssets().then(setTrackedAssets)
    ]).catch(() => {
      dispatch(
        warmDialog({
          open: true,
          type: "warning",
          message: "Please confirm MetaMask's network!",
        }),
      )
    })
  }

  /**
   * 校验fromValue是否为有效输入
   * @returns
   */
  const isValidFromValue = () => {
    if (fromValue === "" || fromValue === "-") return
    // 如果不是一个数值
    if (isNaN(Number(fromValue))) return false
    const nextValue = BN(fromValue)
    const nextFromValue = nextValue.multipliedBy(
      BigNumber.from(10)
        .pow(usdtDecimals)
        .toString(),
    )
    // 判断值为正数
    if (nextFromValue.lte(0)) return false
    if (!isFromValueMax) {
      // 精度处理完之后，应该为整数
      const nextFromValueString = nextValue.multipliedBy(
        BigNumber.from(10)
          .pow(6)
          .toString(),
      )
      if (nextFromValueString.toFixed().indexOf(".") !== -1) return false
    }
    // 数值小于最大数量
    if (fromBalance.lt(BigNumber.from(nextFromValue.toFixed()))) return false
    return true
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
    if (!isToValueMax) {
      // 精度处理完之后，应该为整数
      const nextToValueString = nextValue.multipliedBy(
        BigNumber.from(10)
          .pow(6)
          .toString(),
      )
      if (nextToValueString.toFixed().indexOf(".") !== -1) return false
    }
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

  const diposit = async () => {
    // 如果输入的数字不合法，弹出提示框
    if (!isValidFromValue()) {
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
      BN(fromValue)
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
      setFromValue("")
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
        message: "Please enter the correct Slipper value.",
      })
    }
    withdrawValidFinish = Date.now()
    setCurrentStep(1)
    const allowMaxLossValue = parseInt(100 * parseFloat(allowMaxLoss)) || 0
    const signer = userProvider.getSigner()
    const nextValue = BigNumber.from(
      BN(toValue)
        .multipliedBy(
          BigNumber.from(10)
            .pow(usdtDecimals)
            .toString(),
        )
        .toFixed(),
    )
    try {
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const vaultContractWithSigner = vaultContract.connect(signer)
      let exchangeArray = []
      // 如果不需要兑换则按照多币返回
      if (shouldExchange) {
        console.log("----------start callStatic withdraw----------", nextValue, allowMaxLossValue)

        const [tokens, amounts] = await vaultContractWithSigner.callStatic.withdraw(
          nextValue,
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
            if (tokenItem === USDT_ADDRESS || exchangeAmounts === "0") {
              return {}
            }
            const fromConstrat = new ethers.Contract(tokenItem, IERC20_ABI, userProvider)
            const fromToken = {
              decimals: parseInt((await fromConstrat.decimals()).toString()),
              symbol: await fromConstrat.symbol(),
              address: tokenItem,
            }
            try {
              const bestSwapInfo = await getBestSwapInfo(
                fromToken,
                {
                  decimals: usdtDecimals,
                  symbol: "USDT",
                  address: USDT_ADDRESS,
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
                toToken: USDT_ADDRESS,
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
      let nextArray = filter(exchangeArray, i => !isEmpty(i))
      if (abiPrefix === 'v4.4' || abiPrefix === 'v4.3') {
        nextArray = map(nextArray, i => {
          return {
            ...i,
            exchangeParam: pick(i.exchangeParam, ['encodeExchangeArgs', 'method', 'platform'])
          }
        })
      }
      console.log("nextArray=", nextArray)
      let tx
      // gasLimit如果需要配置倍数的话，则需要estimateGas一下
      if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
        const gas = await vaultContractWithSigner.estimateGas.withdraw(nextValue, allowMaxLossValue, true, nextArray)
        setCurrentStep(4)
        estimateGasFinish = Date.now()
        const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
        // 乘以倍数后，如果大于3千万gas，则按3千万执行
        const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
        tx = await vaultContractWithSigner.withdraw(nextValue, allowMaxLossValue, true, nextArray, {
          gasLimit: maxGasLimit,
        })
      } else {
        tx = await vaultContractWithSigner.withdraw(nextValue, allowMaxLossValue, true, nextArray)
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
            message: "Failed to exchange, please increase the exchange slipper or close exchange!",
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
  const loadTotalAssets = () => {
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    return Promise.all([vaultContract.totalAssets(), vaultContract.pricePerShare()])
  }
  useEffect(() => {
    if (isEmpty(VAULT_ADDRESS)) return
    const loadTotalAssetsFn = () =>
      loadTotalAssets()
        .then(([afterTotalAssets, afterPerFullShare]) => {
          if (!afterTotalAssets.eq(beforeTotalAssets)) {
            setBeforeTotalAssets(totalAssets)
            setTotalAssets(afterTotalAssets)
          }
          if (!afterPerFullShare.eq(beforePerFullShare)) {
            setBeforePerFullShare(perFullShare)
            setPerFullShare(afterPerFullShare)
          }
        })
        .catch(noop)
    const timer = setInterval(loadTotalAssetsFn, 3000)
    return () => clearInterval(timer)
    // eslint-disable-next-line
  }, [totalAssets.toString(), perFullShare.toString()])

  useEffect(() => {
    if (isEmpty(VAULT_ADDRESS)) return
    loadBanlance()
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    if (!isEmpty(address)) {
      vaultContract.on("Deposit", (...eventArgs) => {
        console.log("Deposit=", eventArgs)
        const block = last(eventArgs)
        block &&
          block
            .getTransaction()
            .then(tx => tx.wait())
            .then(loadBanlance)
      })
      vaultContract.on("Withdraw", (...eventArgs) => {
        console.log("Withdraw=", eventArgs)
        const block = last(eventArgs)
        block &&
          block
            .getTransaction()
            .then(tx => tx.wait())
            .then(loadBanlance)
      })
    }

    return () => vaultContract.removeAllListeners(["Deposit", "Withdraw"])
    // eslint-disable-next-line
  }, [address])

  const estimateWithdraw = debounce(async () => {
    setIsEstimate(true)
    const nextValue = BigNumber.from(
      BN(toValue)
        .multipliedBy(
          BigNumber.from(10)
            .pow(usdtDecimals)
            .toString(),
        )
        .toFixed(),
    )
    const allowMaxLossValue = parseInt(100 * parseFloat(allowMaxLoss)) || 0
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const signer = userProvider.getSigner()
    const vaultContractWithSigner = vaultContract.connect(signer)

    try {
      console.log("estimate shouldExchange:", shouldExchange)
      let [tokens, amounts] = await vaultContractWithSigner.callStatic.withdraw(
        nextValue,
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
            if (tokenItem === USDT_ADDRESS || exchangeAmounts === "0") {
              return {}
            }
            const fromConstrat = new ethers.Contract(tokenItem, IERC20_ABI, userProvider)
            const fromToken = {
              decimals: parseInt((await fromConstrat.decimals()).toString()),
              symbol: await fromConstrat.symbol(),
              address: tokenItem,
            }
            try {
              const bestSwapInfo = await getBestSwapInfo(
                fromToken,
                {
                  decimals: usdtDecimals,
                  symbol: "USDT",
                  address: USDT_ADDRESS,
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
                toToken: USDT_ADDRESS,
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
        let nextArray = filter(exchangeArray, i => !isEmpty(i))
        if (abiPrefix === 'v4.4' || abiPrefix === 'v4.3') {
          nextArray = map(nextArray, i => {
            return {
              ...i,
              exchangeParam: pick(i.exchangeParam, ['encodeExchangeArgs', 'method', 'platform'])
            }
          })
        }
        ;[tokens, amounts] = await vaultContractWithSigner.callStatic.withdraw(
          nextValue,
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
            message: "Failed to exchange, please increase the exchange slipper or close exchange!",
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

  useEffect(() => {
    // 未打开高级选项页面，则不继续数值预估
    // 如果输入的slipper等值不正确，则不继续数值预估
    if (isOpenEstimate && isValidAllowLoss() && isValidSlipper() && isValidToValue()){
      estimateWithdraw()
    }
    return () => estimateWithdraw.cancel()
    // eslint-disable-next-line
  }, [toValue, allowMaxLoss, slipper, shouldExchange, isOpenEstimate])

  // 展示vault.totalAssets
  // const fn = value => <span>{toFixed(value, 10 ** 6, 6)} USDT</span>

  /**
   * 将ERC20币添加入metamask账户中
   */
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
    img.src = "/default.webp"
  }

  const renderEstimate = () => {
    if (isEstimate) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div style={{ textAlign: "center", padding: "70px 0 50px" }}>
            <CircularProgress fontSize='large' color='primary' />
          </div>
        </GridItem>
      )
    }
    if (isUndefined(estimateWithdrawArray)) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div style={{ textAlign: "center", minHeight: "100px", color: "#fff", padding: "70px 0 50px" }}>
            <ErrorOutlineIcon fontSize='large' />
            <p>Amount estimate failed, please try again!</p>
          </div>
        </GridItem>
      )
    }
    if (isEmpty(estimateWithdrawArray) || isEmpty(toValue)) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div style={{ textAlign: "center", minHeight: "100px", color: "#fff", padding: "70px 0 50px" }}>
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
            <img className={classes.img} alt='' src={`./images/${item.tokenAddress}.webp`} onError={imgError} />
            &nbsp;&nbsp;~&nbsp;{toFixed(item.amounts, BigNumber.from(10).pow(item.decimals), 6)}
          </Button>
        </GridItem>
      )
    })
  }

  const isValidToValueFlag = isValidToValue()
  const isValidFromValueFlag = isValidFromValue()
  const isValidAllowLossFlag = isValidAllowLoss()
  const isValidSlipperFlag = isValidSlipper()
  let pricePerFullShare = BigNumber.from(10).pow(usdtDecimals)
  if (!totalSupply.eq(BigNumber.from(0))) {
    pricePerFullShare = totalAssets.mul(BigNumber.from(10).pow(usdtDecimals)).div(totalSupply)
  }

  return (
    <div className={classNames(classes.main, classes.mainRaised)}>
      <div className={classes.container}>
        <GridContainer className={classNames(classes.center)}>
          <GridItem xs={12} sm={12} md={8}>
            <Card style={{ border: "1px solid #fff", padding: 20, backgroundColor: "transparent" }}>
              <CardHeader
                style={{ color: "#fff" }}
                avatar={<img style={{ width: 35 }} alt='' src={`./images/${USDT_ADDRESS}.webp`} />}
                title={<span style={{ fontWeight: 700, fontSize: "16px", lineHeight: "20px" }}>USDT VAULT</span>}
              />
              <GridContainer style={{ padding: "0 20px" }}>
                <GridItem xs={12} sm={12} md={12} lg={12}>
                  <CustomInput
                    labelText={`Balance: ${toFixed(fromBalance, BigNumber.from(10).pow(usdtDecimals), 6)}`}
                    inputProps={{
                      placeholder: "deposit amount",
                      value: fromValue,
                      endAdornment: (
                        <span
                          style={
                            isFromValueMax
                              ? { color: "#da2eef", cursor: "pointer", fontWeight: "bold" }
                              : { color: "#69c0ff", cursor: "pointer" }
                          }
                          onClick={() => {
                            setFromValue(toFixed(fromBalance, BigNumber.from(10).pow(usdtDecimals), 6, 1))
                            setIsFromValueMax(true)
                          }}
                        >
                          Max
                        </span>
                      ),
                      onChange: event => {
                        try {
                          setFromValue(event.target.value)
                        } catch (error) {
                          setFromValue("")
                        }
                        setIsFromValueMax(false)
                      },
                    }}
                    error={!isUndefined(isValidFromValueFlag) && !isValidFromValueFlag}
                    success={!isUndefined(isValidFromValueFlag) && isValidFromValueFlag}
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={12} lg={12}>
                  <GridContainer>
                    <GridItem xs={8} sm={8} md={9} lg={9}>
                      <Muted>
                        <p style={{ fontSize: 16, wordBreak: "break-all", letterSpacing: "0.01071em" }}>
                          Estimated Shares：
                          {isValidFromValueFlag &&
                            toFixed(
                              BN(fromValue)
                                .multipliedBy(
                                  BigNumber.from(10)
                                    .pow(usdtDecimals + usdtDecimals)
                                    .toString(),
                                )
                                .div(pricePerFullShare.toString())
                                .toFixed(),
                              BigNumber.from(10).pow(usdtDecimals),
                              usdtDecimals,
                            )}
                        </p>
                      </Muted>
                    </GridItem>
                    <GridItem xs={4} sm={4} md={3} lg={3}>
                      <Button color='colorfull' onClick={diposit} style={{ width: 122, margin: "6px 0" }}>
                        Deposit
                      </Button>
                    </GridItem>
                  </GridContainer>
                </GridItem>
                <GridItem xs={12} sm={12} md={12} lg={12}>
                  <CustomInput
                    labelText={
                      <CountTo
                        from={Number(beforePerFullShare.toBigInt())}
                        to={Number(perFullShare.toBigInt())}
                        speed={3500}
                      >
                        {v =>
                          `Shares: ${toFixed(toBalance, BigNumber.from(10).pow(usdtDecimals), 6)}${` (~${toFixed(
                            toBalance.mul(v),
                            BigNumber.from(10).pow(usdtDecimals + usdtDecimals),
                            6,
                          )} USDT)`}`
                        }
                      </CountTo>
                    }
                    inputProps={{
                      placeholder: "withdraw amount",
                      value: toValue,
                      endAdornment: (
                        <span
                          style={
                            isToValueMax
                              ? { color: "#da2eef", cursor: "pointer", fontWeight: "bold" }
                              : { color: "#69c0ff", cursor: "pointer" }
                          }
                          onClick={() => {
                            setToValue(toFixed(toBalance, BigNumber.from(10).pow(usdtDecimals), 6, 1))
                            setIsToValueMax(true)
                          }}
                        >
                          Max
                        </span>
                      ),
                      onChange: event => {
                        try {
                          setToValue(event.target.value)
                        } catch (error) {
                          setToValue("")
                        }
                        setIsToValueMax(false)
                      },
                    }}
                    error={!isUndefined(isValidToValueFlag) && !isValidToValueFlag}
                    success={!isUndefined(isValidToValueFlag) && isValidToValueFlag}
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={12} lg={12}>
                  {isOpenEstimate ? (
                    <GridContainer>
                      <GridItem
                        xs={8}
                        sm={8}
                        md={9}
                        lg={9}
                        style={{ color: "#39d0d8", textAlign: "right", lineHeight: "35px", padding: "10px 0" }}
                      >
                        <CropIcon
                          fontSize='large'
                          style={{ float: "right", cursor: "pointer" }}
                          onClick={() => setIsOpenEstimate(false)}
                        ></CropIcon>
                        <span style={{ cursor: "pointer" }} onClick={() => setIsOpenEstimate(false)}>
                          Advanced Settings
                        </span>
                      </GridItem>
                      <GridItem xs={4} sm={4} md={3} lg={3}>
                        <Button color='colorfull' onClick={withdraw}>
                          Withdraw
                        </Button>
                      </GridItem>
                      <GridItem xs={12} sm={12} md={12} lg={12}>
                        <GridContainer>
                          <GridItem xs={12} sm={12} md={4} lg={4} style={{ padding: "34px 0px 33px 15px" }}>
                            <span
                              title='Withdrawal tokens and estimated amount'
                              style={{
                                color: "#fff",
                                fontSize: 16,
                                letterSpacing: "0.01071em",
                                lineHeight: 1.5,
                              }}
                            >
                              Withdrawal tokens and estimated amount
                            </span>
                          </GridItem>
                          <GridItem xs={8} sm={8} md={4} lg={4}>
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
                              style={{ padding: "38px 0px", marginLeft: 0 }}
                              label={
                                <Muted>
                                  Exchanged:
                                  <Tooltip
                                    placement='top'
                                    title='Please pre-set the acceptable exchange loss when the exchange is enabled'
                                  >
                                    <InfoIcon style={{ color: "#fff", verticalAlign: "middle", fontSize: 16 }} />
                                  </Tooltip>
                                </Muted>
                              }
                            />
                          </GridItem>
                          <GridItem xs={4} sm={4} md={4} lg={4}>
                            <CustomInput
                              labelText='Max Loss'
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
                              }}
                            />
                          </GridItem>
                        </GridContainer>
                      </GridItem>
                      {shouldExchange && (
                        <GridItem xs={12} sm={12} md={12} lg={12}>
                          <GridContainer>
                            <GridItem xs={8} sm={8} md={6} lg={6}>
                              <RadioGroup
                                row
                                value={slipper}
                                style={{ padding: "36px 0" }}
                                onChange={event => setSlipper(event.target.value)}
                              >
                                <FormControlLabel
                                  value='0.3'
                                  style={{ color: "#fff" }}
                                  control={<CustomRadio />}
                                  label='0.3%'
                                />
                                <FormControlLabel
                                  value='0.5'
                                  style={{ color: "#fff" }}
                                  control={<CustomRadio />}
                                  label='0.5%'
                                />
                                <FormControlLabel
                                  value='1'
                                  style={{ color: "#fff" }}
                                  control={<CustomRadio />}
                                  label='1%'
                                />
                              </RadioGroup>
                            </GridItem>
                            <GridItem xs={4} sm={4} md={6} lg={6}>
                              <CustomInput
                                labelText='Slipper'
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
                                }}
                              />
                            </GridItem>
                          </GridContainer>
                        </GridItem>
                      )}
                      {renderEstimate()}
                    </GridContainer>
                  ) : (
                    <GridContainer>
                      <GridItem
                        xs={8}
                        sm={8}
                        md={9}
                        lg={9}
                        style={{ color: "#da2eef", textAlign: "right", lineHeight: "35px", padding: "10px 0" }}
                      >
                        <CropFreeIcon
                          fontSize='large'
                          style={{ cursor: "pointer", float: "right" }}
                          onClick={() => setIsOpenEstimate(true)}
                        ></CropFreeIcon>
                        <span style={{ cursor: "pointer" }} onClick={() => setIsOpenEstimate(true)}>
                          Advanced Settings
                        </span>
                      </GridItem>
                      <GridItem xs={4} sm={4} md={3} lg={3}>
                        <Button color='colorfull' onClick={withdraw}>
                          Withdraw
                        </Button>
                      </GridItem>
                    </GridContainer>
                  )}
                </GridItem>
              </GridContainer>
            </Card>
          </GridItem>
        </GridContainer>
        <p style={{ color: "#fff", letterSpacing: "0.01071em" }}>More Details</p>
        <TableContainer component={Paper} style={{ borderRadius: 0 }}>
          <Table className={classNames(classes.table)} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell className={classNames(classes.tableCell)}>Vault Symbol</TableCell>
                <TableCell className={classNames(classes.tableCell)}>Vault Address</TableCell>
                <TableCell className={classNames(classes.tableCell)}>PricePerShare</TableCell>
                {/* <TableCell className={classNames(classes.tableCell)}>质押通证符号</TableCell>
                <TableCell className={classNames(classes.tableCell)}>质押合约地址</TableCell> */}
                <TableCell className={classNames(classes.tableCell)}>TVL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell className={classNames(classes.tableCell)} component='th' scope='row'>
                  BOC_Vault
                </TableCell>
                <TableCell className={classNames(classes.tableCell)}>
                  <a
                    style={{ color: "rgb(105, 192, 255)" }}
                    href={CHAIN_BROWSER_URL && `${CHAIN_BROWSER_URL}/address/${VAULT_ADDRESS}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {VAULT_ADDRESS}
                  </a>
                </TableCell>
                <TableCell className={classNames(classes.tableCell)} component='th' scope='row'>
                  <CountTo
                    from={Number(beforePerFullShare.toBigInt())}
                    to={Number(perFullShare.toBigInt())}
                    speed={3500}
                  >
                    {v => toFixed(v, BigNumber.from(10).pow(usdtDecimals), 6)}
                  </CountTo>
                </TableCell>
                {/* <TableCell className={classNames(classes.tableCell)}>USDT</TableCell>
                <TableCell className={classNames(classes.tableCell)}>
                  <a
                    style={{ color: "rgb(105, 192, 255)" }}
                    href={CHAIN_BROWSER_URL && `${CHAIN_BROWSER_URL}/address/${USDT_ADDRESS}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {USDT_ADDRESS}
                  </a>
                </TableCell> */}
                <TableCell className={classNames(classes.tableCell)}>
                  <CountTo from={Number(beforeTotalAssets.toBigInt())} to={Number(totalAssets.toBigInt())} speed={3500}>
                    {v => {
                      return `${toFixed(v, BigNumber.from(10).pow(usdtDecimals), 6)} USDT`
                    }}
                  </CountTo>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      {/* deposit时的loading窗 */}
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
      {/* withdraw时的loading窗 */}
      <Modal
        className={classes.modal}
        open={isWithdrawLoading}
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
      >
        <Paper
          elevation={3}
          style={{
            padding: 20,
            minWidth: 650,
            color: "rgba(255,255,255, 0.87)",
            border: "1px solid",
            background: "#150752",
          }}
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
    </div>
  )
}
