import React, { useState, useEffect, useCallback } from "react"
import * as ethers from "ethers"
import BN from "bignumber.js"
import { useDispatch } from "react-redux"
import { makeStyles } from "@material-ui/core/styles"
import CircularProgress from "@material-ui/core/CircularProgress"
import Modal from "@material-ui/core/Modal"
import Paper from "@material-ui/core/Paper"
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline"
import AddIcon from "@material-ui/icons/Add"
import AndroidIcon from "@material-ui/icons/Android"
import Step from "@material-ui/core/Step"
import WarningIcon from "@material-ui/icons/Warning"
import Tooltip from "@material-ui/core/Tooltip"
import InfoIcon from "@material-ui/icons/Info"
import Popover from "@material-ui/core/Popover"
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state"
import Box from "@material-ui/core/Box"

import CustomTextField from "../../../components/CustomTextField"
import BocStepper from "../../../components/Stepper/Stepper"
import BocStepLabel from "../../../components/Stepper/StepLabel"
import BocStepIcon from "../../../components/Stepper/StepIcon"
import BocStepConnector from "../../../components/Stepper/StepConnector"
import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"
import Button from "../../../components/CustomButtons/Button"
import Loading from "../../../components/Loading"
import { warmDialog } from "./../../../reducers/meta-reducer"
import { toFixed, formatBalance } from "../../../helpers/number-format"
import { addToken } from "../../../helpers/wallet"
import { EXCHANGE_EXTRA_PARAMS, MULTIPLE_OF_GAS, MAX_GAS_LIMIT, ORACLE_ADDITIONAL_SLIPPAGE } from "../../../constants"

// === Hooks === //
import useRedeemFeeBps from "../../../hooks/useRedeemFeeBps"
import usePriceProvider from "../../../hooks/usePriceProvider"

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
import {
  isAd,
  isEs,
  isRp,
  isMaxLoss,
  isLossMuch,
  isExchangeFail,
  errorTextOutput,
} from "../../../helpers/error-handler"

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

const WITHDRAW_EXCHANGE_THRESHOLD = BigNumber.from(10).pow(16)

export default function Withdraw ({
  ethiBalance,
  ethiDecimals,
  userProvider,
  ETH_ADDRESS,
  VAULT_ADDRESS,
  VAULT_ABI,
  IERC20_ABI,
  EXCHANGE_AGGREGATOR_ABI,
  EXCHANGE_ADAPTER_ABI,
  PRICE_ORCALE_ABI,
  isBalanceLoading,
  reloadBalance,
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [toValue, setToValue] = useState("")
  const [allowMaxLoss, setAllowMaxLoss] = useState("0.3")
  const [slipper, setSlipper] = useState("0.3")
  const [estimateWithdrawArray, setEstimateWithdrawArray] = useState([])
  const [isEstimate, setIsEstimate] = useState(false)
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [withdrawError, setWithdrawError] = useState({})
  const { getPriceProvider } = usePriceProvider({
    userProvider,
    VAULT_ADDRESS,
    VAULT_ABI,
    PRICE_ORCALE_ABI,
  })

  const { value: redeemFeeBps } = useRedeemFeeBps({
    userProvider,
    VAULT_ADDRESS,
    VAULT_ABI,
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

  const estimateWithdraw = useCallback(
    debounce(async () => {
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
        console.log(
          "estimate get exchange path:",
          tokens,
          map(amounts, i => i.toString()),
        )
        // 查询兑换路径
        let exchangeArray = await Promise.all(
          map(tokens, async (tokenItem, index) => {
            const exchangeAmounts = amounts[index].toString()
            if (tokenItem === ETH_ADDRESS || exchangeAmounts === "0") {
              return {}
            }
            const fromConstrat = new ethers.Contract(tokenItem, IERC20_ABI, userProvider)
            const priceProvider = await getPriceProvider()
            const amountsInEth = await priceProvider.valueInEth(tokenItem, exchangeAmounts)
            if (WITHDRAW_EXCHANGE_THRESHOLD.gt(amountsInEth)) {
              return {}
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
              console.log("error=", error)
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
        const errorMsg = errorTextOutput(error)
        let tip = ""
        if (isEs(errorMsg)) {
          tip = "Vault has been shut down, please try again later!"
        } else if (isAd(errorMsg)) {
          tip = "Vault is in adjustment status, please try again later!"
        } else if (isRp(errorMsg)) {
          tip = "Vault is in rebase status, please try again later!"
        } else if (isMaxLoss(errorMsg)) {
          tip = "Failed to withdraw, please increase the Max Loss!"
        } else if (isLossMuch(errorMsg)) {
          tip = "Failed to exchange, please increase the exchange slippage!"
        } else if (isExchangeFail(errorMsg)) {
          tip = "Failed to exchange, Please try again later!"
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
        }, 500)
      }
    }, 1500),
  )

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
          if (tokenItem === ETH_ADDRESS || exchangeAmounts === "0") {
            return {}
          }
          const fromConstrat = new ethers.Contract(tokenItem, IERC20_ABI, userProvider)
          const priceProvider = await getPriceProvider()
          const amountsInEth = await priceProvider.valueInEth(tokenItem, exchangeAmounts)
          if (WITHDRAW_EXCHANGE_THRESHOLD.gt(amountsInEth)) {
            return {}
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
      const errorMsg = errorTextOutput(error)
      let tip = ""
      if (isEs(errorMsg)) {
        tip = "Vault has been shut down, please try again later!"
      } else if (isAd(errorMsg)) {
        tip = "Vault is in adjustment status, please try again later!"
      } else if (isRp(errorMsg)) {
        tip = "Vault is in rebase status, please try again later!"
      } else if (isMaxLoss(errorMsg)) {
        tip = "Failed to withdraw, please increase the Max Loss!"
      } else if (isLossMuch(errorMsg)) {
        tip = "Failed to exchange, please increase the exchange slippage!"
      } else if (isExchangeFail(errorMsg)) {
        tip = "Failed to exchange, Please try again later!"
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
    if (toValue === "" || toValue === "-" || isEmpty(toValue.replace(/ /g, ""))) return
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
    if (allowMaxLoss === "" || isEmpty(allowMaxLoss.replace(/ /g, ""))) return
    if (isNaN(allowMaxLoss)) return false
    if (allowMaxLoss < 0 || allowMaxLoss > 50) return false
    return true
  }

  const isValidSlipper = () => {
    if (slipper === "" || isEmpty(slipper.replace(/ /g, ""))) return
    if (isNaN(slipper)) return false
    if (slipper < 0 || slipper > 45) return false
    return true
  }

  useEffect(() => {
    // 未打开高级选项页面，则不继续数值预估
    // 如果输入的slipper等值不正确，则不继续数值预估
    if (isValidAllowLoss() && isValidSlipper() && isValidToValue()) {
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
  }, [toValue, allowMaxLoss, slipper])

  const handleAmountChange = event => {
    try {
      setToValue(event.target.value)
    } catch (error) {
      setToValue("")
    }
  }

  const handleMaxClick = async () => {
    const [nextEthiBalance] = await reloadBalance()
    setToValue(formatBalance(nextEthiBalance, ethiDecimals, { showAll: true }))
  }

  const renderEstimate = () => {
    if (isEstimate) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.estimateItem}>
            <CircularProgress fontSize='large' color='primary' />
          </div>
        </GridItem>
      )
    }
    if (isUndefined(estimateWithdrawArray)) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.estimateItem}>
            <ErrorOutlineIcon fontSize='large' />
            <p>Amount estimate failed, please try again!</p>
          </div>
        </GridItem>
      )
    }
    if (isEmpty(estimateWithdrawArray) || isEmpty(toValue)) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.estimateItem}>
            <AndroidIcon fontSize='large' />
            <p>No estimated value available</p>
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
            onClick={() => addToken(item.tokenAddress)}
          >
            {item.tokenAddress !== ETH_ADDRESS && (
              <AddIcon fontSize='small' style={{ position: "absolute", top: 25, left: 45 }} />
            )}
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

  const isValidToValueFlag = isValidToValue()
  const isValidAllowLossFlag = isValidAllowLoss()
  const isValidSlipperFlag = isValidSlipper()

  const isLogin = !isEmpty(userProvider)

  return (
    <>
      <div className={classes.setting}>
        <PopupState variant='popover' popupId='setting-popover'>
          {popupState => (
            <div>
              <svg
                width='30'
                height='30'
                viewBox='0 0 30 30'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                {...bindTrigger(popupState)}
              >
                <path
                  d='M15 20.625C18.1066 20.625 20.625 18.1066 20.625 15C20.625 11.8934 18.1066 9.375 15 9.375C11.8934 9.375 9.375 11.8934 9.375 15C9.375 18.1066 11.8934 20.625 15 20.625Z'
                  stroke='#A0A0A0'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M21.5273 7.62891C21.8242 7.90234 22.1055 8.18359 22.3711 8.47266L25.5703 8.92969C26.0916 9.83497 26.4934 10.804 26.7656 11.8125L24.8203 14.4023C24.8203 14.4023 24.8555 15.1992 24.8203 15.5977L26.7656 18.1875C26.4946 19.1965 26.0928 20.1656 25.5703 21.0703L22.3711 21.5273C22.3711 21.5273 21.8203 22.1016 21.5273 22.3711L21.0703 25.5703C20.165 26.0916 19.196 26.4934 18.1875 26.7656L15.5977 24.8203C15.2 24.8555 14.8 24.8555 14.4023 24.8203L11.8125 26.7656C10.8035 26.4946 9.83438 26.0928 8.92969 25.5703L8.47266 22.3711C8.18359 22.0977 7.90234 21.8164 7.62891 21.5273L4.42969 21.0703C3.90842 20.165 3.50663 19.196 3.23438 18.1875L5.17969 15.5977C5.17969 15.5977 5.14453 14.8008 5.17969 14.4023L3.23438 11.8125C3.50537 10.8035 3.90722 9.83438 4.42969 8.92969L7.62891 8.47266C7.90234 8.18359 8.18359 7.90234 8.47266 7.62891L8.92969 4.42969C9.83497 3.90842 10.804 3.50663 11.8125 3.23438L14.4023 5.17969C14.8 5.14452 15.2 5.14452 15.5977 5.17969L18.1875 3.23438C19.1965 3.50537 20.1656 3.90722 21.0703 4.42969L21.5273 7.62891Z'
                  stroke='#A0A0A0'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <Popover
                classes={{ paper: classes.popover }}
                {...bindPopover(popupState)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
              >
                <Box p={2}>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12} lg={12}>
                      <p className={classes.popoverTitle}>Max Loss</p>
                      <CustomTextField
                        classes={{ root: classes.input }}
                        value={allowMaxLoss}
                        placeholder='Allow loss percent'
                        maxEndAdornment
                        onMaxClick={() => setAllowMaxLoss("50")}
                        onChange={event => {
                          const value = event.target.value
                          setAllowMaxLoss(value)
                        }}
                        error={!isUndefined(isValidAllowLossFlag) && !isValidAllowLossFlag}
                      />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={12} lg={12}>
                      <p className={classes.popoverTitle}>Slippage</p>
                      <CustomTextField
                        classes={{ root: classes.input }}
                        value={slipper}
                        placeholder='Allow slipper percent'
                        maxEndAdornment
                        onMaxClick={() => setSlipper("45")}
                        onChange={event => {
                          const value = event.target.value
                          setSlipper(value)
                        }}
                        error={!isUndefined(isValidSlipperFlag) && !isValidSlipperFlag}
                      />
                    </GridItem>
                  </GridContainer>
                </Box>
              </Popover>
            </div>
          )}
        </PopupState>
      </div>
      <GridContainer className={classes.withdrawContainer}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText}>From</p>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.inputLabelWrapper}>
            <div className={classes.tokenInfo}>
              <span className={classes.tokenName}>ETHi</span>
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
          <p className={classes.estimateText} title={formatBalance(ethiBalance, ethiDecimals, { showAll: true })}>
            Balance:&nbsp;&nbsp;<Loading loading={isBalanceLoading}>{formatBalance(ethiBalance, ethiDecimals)}</Loading>
          </p>
        </GridItem>
      </GridContainer>
      <GridContainer className={classes.outputContainer}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText}>To</p>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.selectorlWrapper}>
            <p className={classes.estimateBalanceTitle}>ETH</p>
          </div>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          {renderEstimate()}
        </GridItem>
        {isEmpty(VAULT_ADDRESS) && (
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <p style={{ textAlign: "center", color: "red" }}>Switch to the ETH chain firstly!</p>
          </GridItem>
        )}
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
                <InfoIcon style={{ marginLeft: "0.5rem" }} />
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
          </div>
        </Paper>
      </Modal>
    </>
  )
}
