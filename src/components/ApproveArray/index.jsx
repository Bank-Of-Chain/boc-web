import React, { useEffect, useState, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import SimpleSelect from '@/components/SimpleSelect'
import Button from '@/components/CustomButtons/Button'
import CustomTextField from '@/components/CustomTextField'
import Loading from '@/components/LoadingComponent'
import AddIcon from '@material-ui/icons/Add'
import ReplayIcon from '@material-ui/icons/Replay'
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt'
import CachedIcon from '@material-ui/icons/Cached'

// === Utils === //
import { useDispatch } from 'react-redux'
import * as ethers from 'ethers'
import get from 'lodash/get'
import map from 'lodash/map'
import some from 'lodash/some'
import size from 'lodash/size'
import uniq from 'lodash/uniq'
import first from 'lodash/first'
import isNil from 'lodash/isNil'
import every from 'lodash/every'
import assign from 'lodash/assign'
import reduce from 'lodash/reduce'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
import compact from 'lodash/compact'
import findIndex from 'lodash/findIndex'
import isEqual from 'lodash/isEqual'
import isNumber from 'lodash/isNumber'
import min from 'lodash/min'
import { toFixed } from '@/helpers/number-format'
import { getBestSwapInfo } from 'piggy-finance-utils'
import BN from 'bignumber.js'
import { addToken } from '@/helpers/wallet'
import { warmDialog } from '@/reducers/meta-reducer'
import { getProtocolsFromBestRouter } from '@/helpers/swap-util'
import { errorTextOutput, isLossMuch } from '@/helpers/error-handler'

// === Constants === //
import {
  IERC20_ABI,
  EXCHANGE_EXTRA_PARAMS,
  ORACLE_ADDITIONAL_SLIPPAGE,
  USDT_ADDRESS,
  USDC_ADDRESS,
  DAI_ADDRESS,
  MULTIPLE_OF_GAS,
  MAX_GAS_LIMIT
} from '@/constants'
import { ETH_ADDRESS, WETH_ADDRESS } from '@/constants/tokens'
import { BN_6, BN_18 } from '@/constants/big-number'

// === Styles === //
import styles from './style'

const { Contract, BigNumber } = ethers
const useStyles = makeStyles(styles)

const MAX_RETRY_TIME = 2
const BN_0 = BigNumber.from('0')

const ApproveArray = props => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const {
    isEthi,
    userProvider,
    tokens,
    address: userAddress,
    exchangeManager,
    EXCHANGE_AGGREGATOR_ABI,
    slippage,
    EXCHANGE_ADAPTER_ABI,
    handleClose,
    onSlippageChange
  } = props

  const initValues = map(tokens, () => undefined)
  const initBoolValues = map(tokens, () => false)
  const initNumberValues = map(tokens, () => 0)
  const initObjectValues = map(tokens, () => {
    return {}
  })

  const [receiveToken, setReceiveToken] = useState(isEthi ? ETH_ADDRESS : USDT_ADDRESS)
  // input values
  const [values, setValues] = useState([])
  const [balances, setBalances] = useState([])
  const [decimals, setDecimals] = useState([])
  const [allowances, setAllowances] = useState([])
  const [isSwapping, setIsSwapping] = useState(false)
  // excludeArray for 1inch/paraswap
  const [excludeArray, setExcludeArray] = useState(initObjectValues)
  // If it is reloading account base info
  const [isReload, setIsReload] = useState(false)
  // swap path info of tokens
  const [swapInfoArray, setSwapInfoArray] = useState(initValues)
  // If it is fetching swap path
  const [isSwapInfoFetching, setIsSwapInfoFetching] = useState(initBoolValues)
  // If it is staticCalling
  const [isStaticCalling, setIsStaticCalling] = useState(initBoolValues)
  // If finish fetching swap path and staticCalling
  const [doneArray, setDoneArray] = useState(initBoolValues)
  // Each token estimate retry times, less than 3
  const [retryTimesArray, setRetryTimesArray] = useState(initNumberValues)

  // some tokens is fetching swap path
  const isSwapInfoFetchingSome = some(isSwapInfoFetching)
  // some tokens is staticCalling
  const isStaticCallingSome = some(isStaticCalling)
  // some tokens approve enough but not done
  const someStaticCallError = () => {
    return some(tokens, (item, i) => {
      const isFetching = !isReciveToken(i) && (isSwapInfoFetching[i] || isStaticCalling[i])
      return !isFetching && !isReciveToken(i) && (swapInfoArray[i] instanceof Error || retryTimesArray[i] > MAX_RETRY_TIME)
    })
  }
  // check if the approve amount is enough
  const isApproveNotEnough = index => {
    const token = tokens[index]
    const allowance = allowances[index]
    const decimal = decimals[index]
    const value = values[index]
    if (isEmpty(allowance) || isEmpty(decimal) || isEmpty(value) || token.address === ETH_ADDRESS || isReciveToken(index)) return false
    try {
      const nextValue = new BN(value).multipliedBy(decimal.toString())
      return nextValue.gt(allowance)
    } catch (error) {
      return false
    }
  }
  // check the receive token is current index?
  const isReciveToken = index => {
    return tokens[index]?.address === receiveToken
  }
  // check the slippage is valid or not
  const isValidSlippage = () => {
    if (isNaN(slippage)) return false
    if (slippage < 0.01 || slippage > 45) return false
    return true
  }
  // has some item fetch swap path failed
  const isSwapError = () => {
    return some(swapInfoArray, el => el instanceof Error)
  }
  // some token value is valid
  const someTokenHasValidValue = () => {
    return some(values, (item, index) => {
      return !isReciveToken(index) && !isEmpty(item) && item !== '0'
    })
  }
  // Check if value is gt balance, or lt 1 decimal
  const isErrorValue = (index, value) => {
    if (!value) {
      value = values[index]
    }
    if (!value) {
      return false
    }
    const decimal = decimals[index]
    if (!decimal) {
      return false
    }
    const balance = balances[index]
    const nextFromValueString = new BN(value).multipliedBy(decimal.toString())
    return !isReciveToken(index) && !isEmpty(value) && (nextFromValueString.gt(balance) || nextFromValueString.toFixed().indexOf('.') !== -1)
  }
  // Check if value is empty
  const isEmptyValue = (index, value) => {
    if (!value) {
      value = values[index]
    }
    return !isReciveToken(index) && (isEmpty(value) || value === '0')
  }

  const receiveAmount = reduce(
    swapInfoArray,
    (rs, item) => {
      return rs.add(BigNumber.from(get(item, 'bestSwapInfo.toTokenAmount', '0')))
    },
    BigNumber.from(0)
  )

  const noNeedSwap = size(tokens) === 1 && get(first(tokens), 'address', '') === receiveToken

  const getExchangePlatformAdapters = async (exchangeAggregator, userProvider) => {
    const { _exchangeAdapters: adapters } = await exchangeAggregator.getExchangeAdapters()
    const exchangePlatformAdapters = {}
    for (const address of adapters) {
      const contract = new ethers.Contract(address, EXCHANGE_ADAPTER_ABI, userProvider)
      exchangePlatformAdapters[await contract.identifier()] = address
    }
    return exchangePlatformAdapters
  }

  const selectOptions = isEthi
    ? [
        {
          label: 'ETH',
          value: ETH_ADDRESS,
          img: `./images/${ETH_ADDRESS}.png`,
          decimal: BN_18
        }
      ]
    : [
        {
          label: 'USDT',
          value: USDT_ADDRESS,
          img: `./images/${USDT_ADDRESS}.png`,
          decimal: BN_6
        },
        {
          label: 'USDC',
          value: USDC_ADDRESS,
          img: `./images/${USDC_ADDRESS}.png`,
          decimal: BN_6
        },
        {
          label: 'DAI',
          value: DAI_ADDRESS,
          img: `./images/${DAI_ADDRESS}.png`,
          decimal: BN_18
        }
      ]

  const receiveTokenDecimals = selectOptions.find(el => el.value === receiveToken).decimal
  const receiveTokenAmount = values[findIndex(tokens, el => el.address === receiveToken)] || '0'

  // Get values, balances, decimals, allowances
  const reload = useCallback(async () => {
    console.log('---reload---')
    if (isEmpty(tokens) || isEmpty(exchangeManager) || isEmpty(userAddress)) {
      return
    }
    setIsReload(true)
    const array = await Promise.all(
      map(tokens, async token => {
        const { address, amount } = token
        if (address === ETH_ADDRESS) {
          return {
            address,
            amount,
            decimal: 18,
            allowance: '0',
            balance: (await userProvider.getBalance(userAddress).catch(() => BN_0)).toString()
          }
        }
        const contract = new Contract(address, IERC20_ABI, userProvider)
        const allowance = (await contract.allowance(userAddress, exchangeManager).catch(() => BN_0)).toString()
        const balance = (await contract.balanceOf(userAddress).catch(() => BN_0)).toString()
        const decimal = await contract.decimals().catch(() => BN_0)
        return {
          address,
          amount,
          decimal,
          allowance,
          balance
        }
      })
    )
    const { nextAllowances, nextBalances, nextDecimals, nextValues } = reduce(
      array,
      (rs, item, i) => {
        const { allowance, balance, amount, decimal } = item
        rs.nextAmounts[i] = amount
        rs.nextBalances[i] = balance
        rs.nextDecimals[i] = BigNumber.from(10).pow(decimal)
        rs.nextAllowances[i] = allowance
        rs.nextValues[i] = values[i] || toFixed(amount, BigNumber.from(10).pow(decimal))
        return rs
      },
      {
        nextAllowances: [],
        nextBalances: [],
        nextAmounts: [],
        nextDecimals: [],
        nextValues: []
      }
    )
    setValues(nextValues)
    setBalances(nextBalances)
    setDecimals(nextDecimals)
    setAllowances(nextAllowances)
    setIsReload(false)
  }, [tokens, userAddress, values, exchangeManager])

  const handleInputChange = (val, index) => {
    const num = Number(val)
    // Maybe num is NaN
    if (!(num >= 0)) {
      return
    }
    const nextValues = map(tokens, (v, i) => {
      if (i === index) return val
      return values[i]
    })
    setValues(nextValues)
    debounceUpdate(num, index, nextValues)
  }

  const debounceUpdate = useCallback(
    debounce((val, index, nextValues) => {
      const nextSwapInfoArray = map(swapInfoArray, (item, i) => {
        if (i === index) return undefined
        return item
      })
      const nextDoneArray = map(doneArray, (item, i) => {
        if (i === index) return false
        return item
      })
      const nextIsSwapInfoFetching = map(isSwapInfoFetching, (item, i) => {
        if (i === index) {
          return !isErrorValue(index, val) && !isEmptyValue(index, val)
        }
        return item
      })
      const nextExcludeArray = map(excludeArray, (item, i) => {
        if (i === index) return {}
        return item
      })
      setDoneArray(nextDoneArray)
      setSwapInfoArray(nextSwapInfoArray)
      setIsStaticCalling(initBoolValues)
      setIsSwapInfoFetching(nextIsSwapInfoFetching)
      setRetryTimesArray(initNumberValues)
      setExcludeArray(nextExcludeArray)
      estimateWithValue(nextValues, index)
    }, 1500),
    [swapInfoArray, doneArray, isSwapInfoFetching, excludeArray]
  )

  const approveValue = async index => {
    console.log(`---approveValue ${index}---`)
    const token = get(tokens, index)
    const value = get(values, index)
    const decimal = get(decimals, index)
    // ETH no need approve
    if (isEmpty(token) || isNil(value) || value === '0') return
    const { address } = token
    const signer = userProvider.getSigner()
    const contract = new Contract(address, IERC20_ABI, userProvider)
    const contractWithUser = contract.connect(signer)
    let nextValue
    try {
      nextValue = BigNumber.from(new BN(value).multipliedBy(decimal.toString()).toFixed())
    } catch (e) {
      return
    }
    const allowanceAmount = await contractWithUser.allowance(userAddress, exchangeManager)
    // If deposit amount greater than allow amount, reset amount
    if (nextValue.gt(allowanceAmount)) {
      // If allowance equal 0, approve nextAmount, otherwise increaseAllowance
      if (allowanceAmount.gt(0)) {
        if (address === WETH_ADDRESS) {
          // WETH don't support increaseAllowance
          return contractWithUser
            .approve(exchangeManager, 0)
            .then(tx => tx.wait())
            .then(() => {
              reload()
              return contractWithUser.approve(exchangeManager, nextValue).then(tx => tx.wait())
            })
        }
        return contractWithUser
          .increaseAllowance(exchangeManager, nextValue.sub(allowanceAmount))
          .then(tx => tx.wait())
          .catch(e => {
            // cancel by user
            if (e.code === 4001) {
              return Promise.reject(e)
            }
            // If increase failed, approve 0 and approve nextAmounts
            return contractWithUser
              .approve(exchangeManager, 0)
              .then(tx => tx.wait())
              .then(() => {
                reload()
                return contractWithUser.approve(exchangeManager, nextValue).then(tx => tx.wait())
              })
          })
      } else {
        return contractWithUser
          .approve(exchangeManager, nextValue)
          .then(tx => tx.wait())
          .catch(e => {
            // cancel by user
            if (e.code === 4001) {
              return Promise.reject(e)
            }
          })
      }
    }
  }

  const approveAll = async () => {
    console.log('---approveAll---')
    setIsSwapping(true)
    try {
      for (let i = 0; i < tokens.length; i++) {
        if (isReciveToken(i)) continue
        await approve(i)
      }
    } catch (error) {
      setIsSwapping(false)
      const message = errorTextOutput(error)
      dispatch(
        warmDialog({
          open: true,
          type: 'error',
          message
        })
      )
      return
    }
  }

  // swap triggered by useEffect
  const swap = async () => {
    if (!isSwapping) {
      return
    }
    if (isEmpty(swapInfoArray)) {
      setIsSwapping(false)
      return
    }
    const someApproveNotEnough = some(tokens, (token, index) => {
      return isApproveNotEnough(index)
    })
    if (someApproveNotEnough) {
      dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Please approve the amount of coins to be exchanged in full!'
        })
      )
      setIsSwapping(false)
      return
    }
    realSwap()
  }

  // All done, swap
  const realSwap = async () => {
    console.log('---realSwap---')
    const nextSwapArray = compact(
      map(swapInfoArray, item => {
        if (isEmpty(item) || item instanceof Error) return
        const {
          bestSwapInfo: { platform, method, encodeExchangeArgs },
          info
        } = item
        return {
          platform,
          method,
          data: encodeExchangeArgs,
          swapDescription: info
        }
      })
    )
    const constract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
    const signer = userProvider.getSigner()
    const contractWithSigner = constract.connect(signer)

    try {
      let tx
      // if gasLimit times not 1, need estimateGas
      if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
        const gas = await contractWithSigner.estimateGas.batchSwap(nextSwapArray)
        const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
        // gasLimit not exceed maximum
        const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
        tx = await contractWithSigner.batchSwap(nextSwapArray, {
          gasLimit: maxGasLimit
        })
      } else {
        tx = await contractWithSigner.batchSwap(nextSwapArray)
      }
      await tx.wait()
      dispatch(
        warmDialog({
          open: true,
          type: 'success',
          message: 'Swap Success!'
        })
      )
      handleClose()
    } catch (error) {
      const errorMsg = errorTextOutput(error)
      let message = 'Swap Failed'
      if (isLossMuch(errorMsg)) {
        message = 'Swap Failed, please increase the exchange slippage'
      } else if (error.code === 4001) {
        message = errorMsg
      }
      dispatch(
        warmDialog({
          open: true,
          type: 'error',
          message
        })
      )
      setIsSwapping(false)
    }
  }

  const queryBestSwapInfo = useCallback(
    async (token, value, decimal, index, exchangePlatformAdapters) => {
      const swapInfoItem = swapInfoArray[index]
      if (!isEmpty(swapInfoItem) && !(swapInfoItem instanceof Error)) return swapInfoItem
      if (isNil(decimal) || isNil(value) || value === '0' || token.address === receiveToken) return
      const nextFromValueString = new BN(value).multipliedBy(decimal.toString()).toFixed()
      if (nextFromValueString.indexOf('.') !== -1) return
      const swapAmount = BigNumber.from(nextFromValueString)
      let fromToken = {}
      let toToken = {}
      if (token.address === ETH_ADDRESS) {
        fromToken = {
          decimals: 18,
          address: token.address
        }
      } else {
        const fromTokenConstract = new Contract(token.address, IERC20_ABI, userProvider)
        fromToken = {
          decimals: parseInt((await fromTokenConstract.decimals()).toString()),
          address: token.address
        }
      }
      if (receiveToken === ETH_ADDRESS) {
        toToken = {
          decimals: 18,
          address: receiveToken
        }
      } else {
        const toTokenConstract = new Contract(receiveToken, IERC20_ABI, userProvider)
        toToken = {
          decimals: parseInt((await toTokenConstract.decimals()).toString()),
          address: receiveToken
        }
      }
      console.groupCollapsed('fetch best swap path: ' + fromToken.address + '-' + toToken.address + '-' + index)
      let nextExchangeExtraParams = assign({}, EXCHANGE_EXTRA_PARAMS, isEmpty(exchangePlatformAdapters.testAdapter) ? {} : {})

      if (!isEmpty(excludeArray[index])) {
        console.log(`excludeArray[${index}]`, excludeArray[index])
        const { oneInchV4 = [], paraswap = [] } = excludeArray[index]
        nextExchangeExtraParams = assign({}, nextExchangeExtraParams, {
          oneInchV4: {
            ...nextExchangeExtraParams.oneInchV4,
            excludeProtocols: uniq(oneInchV4.concat(nextExchangeExtraParams.oneInchV4.excludeProtocols))
          },
          paraswap: {
            ...nextExchangeExtraParams.paraswap,
            excludeDEXS: uniq([...paraswap, nextExchangeExtraParams.paraswap.excludeDEXS.split(',')]).join(',')
          }
        })
      }
      const bestSwapInfo = await getBestSwapInfo(
        fromToken,
        toToken,
        swapAmount,
        parseInt(100 * parseFloat(slippage)) || 0,
        ORACLE_ADDITIONAL_SLIPPAGE,
        exchangePlatformAdapters,
        nextExchangeExtraParams
      ).catch(error => {
        throw new Error(error)
      })
      console.groupEnd('fetch best swap path: ' + fromToken.address + '-' + toToken.address + '-' + index)
      if (isEmpty(bestSwapInfo)) {
        throw new Error('fetch error')
      }
      return {
        bestSwapInfo,
        info: {
          amount: swapAmount,
          srcToken: token.address,
          dstToken: receiveToken,
          receiver: userAddress
        }
      }
    },
    [excludeArray, receiveToken, slippage]
  )

  const estimateWithValue = useCallback(
    debounce(async (newValues, refreshIndex) => {
      if (isEmpty(receiveToken)) return
      console.log('---estimateWithValue---')
      const exchangeManagerContract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
      const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract, userProvider)
      const nextIsSwapInfoFetching = map(swapInfoArray, (item, index) => {
        if (isReciveToken(index) || isErrorValue(index) || isEmptyValue(index)) {
          return false
        }
        if (retryTimesArray[index] > MAX_RETRY_TIME) {
          setIsSwapping(false)
          return false
        }
        if (!isNil(refreshIndex)) {
          return refreshIndex === index
        }
        return isEmpty(item) || item instanceof Error
      })
      setIsSwapInfoFetching(nextIsSwapInfoFetching)
      const requestArray = map(nextIsSwapInfoFetching, (item, index) => {
        if (!item) return swapInfoArray[index]
        return queryBestSwapInfo(tokens[index], newValues[index] || '0', decimals[index], index, exchangePlatformAdapters).catch(() => {
          return
        })
      })
      Promise.all(requestArray)
        .then(nextSwapArray => {
          if (!isEqual(nextSwapArray, swapInfoArray)) {
            console.log('nextSwapArray', nextSwapArray)
            setSwapInfoArray(nextSwapArray)
          }
          const nextRetryTimesArray = map(retryTimesArray, (item, i) => {
            if (!isReciveToken(i) && !nextSwapArray[i] && !isErrorValue(i) && !isEmptyValue(i)) {
              return min([item + 1, MAX_RETRY_TIME + 1])
            }
            return item
          })
          if (!isEqual(nextRetryTimesArray, retryTimesArray)) {
            console.log('nextRetryTimesArray', nextRetryTimesArray)
            setRetryTimesArray(nextRetryTimesArray)
          }
          const nextIsSwapInfoFetching = map(tokens, (item, index) => {
            if (isReciveToken(index) || retryTimesArray[index] > MAX_RETRY_TIME || isErrorValue(index) || isEmptyValue(index)) {
              return false
            }
            return !doneArray[index] && !isApproveNotEnough(index)
          })
          setIsSwapInfoFetching(nextIsSwapInfoFetching)
        })
        .catch(() => {
          setIsSwapInfoFetching(initBoolValues)
        })
    }, 1500),
    [receiveToken, exchangeManager, tokens, decimals, swapInfoArray, retryTimesArray, doneArray, queryBestSwapInfo]
  )

  const reloadSwap = index => {
    const nextSwapInfoArray = map(swapInfoArray, (item, i) => {
      if (i === index) return undefined
      return item
    })

    const nextIsSwapInfoFetching = map(isSwapInfoFetching, (item, i) => {
      if (i === index) return true
      return false
    })

    const nextRetryTimesArray = map(retryTimesArray, (item, i) => {
      if (i === index) return 0
      return item
    })

    setSwapInfoArray(nextSwapInfoArray)
    setIsSwapInfoFetching(nextIsSwapInfoFetching)
    setRetryTimesArray(nextRetryTimesArray)
    estimateWithValue(values, index)
  }

  // approve the current token with current value
  const approve = index => {
    return approveValue(index).then(reload)
  }

  const clickSwap = () => {
    const allDone = every(doneArray, (item, index) => {
      return item || isReciveToken(index)
    })
    if (allDone) {
      setIsSwapping(true)
      realSwap()
    } else {
      approveAll()
    }
  }

  const changeSlippage = value => {
    setSwapInfoArray(initValues)
    setDoneArray(initBoolValues)
    setRetryTimesArray(initNumberValues)
    setExcludeArray(initObjectValues)
    onSlippageChange(value)
  }

  useEffect(() => {
    if (isEmpty(userAddress)) return
    reload()
    // const timer = setInterval(reload, 10000)
    // return () => clearInterval(timer)
  }, [tokens, userAddress, exchangeManager])

  useEffect(() => {
    if (isReload || isEmpty(receiveToken) || !isValidSlippage() || !someTokenHasValidValue()) {
      return
    }
    estimateWithValue(values)
    return () => estimateWithValue.cancel()
  }, [isReload, estimateWithValue])

  useEffect(() => {
    const allDone = every(doneArray, (item, index) => {
      return item || isReciveToken(index)
    })
    console.log('all done', allDone)
    if (!allDone) {
      return
    }
    swap()
  }, [doneArray])

  useEffect(() => {
    console.log('---staticCall---')
    console.log('swapInfoArray', swapInfoArray)
    if (
      isEmpty(exchangeManager) ||
      !someTokenHasValidValue() ||
      isEmpty(swapInfoArray) ||
      every(swapInfoArray, item => isEmpty(item)) ||
      every(tokens, (item, i) => !isReciveToken(i) && isApproveNotEnough(i))
    ) {
      console.log('staticCall return')
      setIsSwapInfoFetching(initBoolValues)
      // setIsSwapping(false)
      return
    }
    const constract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
    const signer = userProvider.getSigner()
    const constractWithSigner = constract.connect(signer)

    const staticCallParamsArray = map(swapInfoArray, (item, index) => {
      const doneArrayItem = doneArray[index]
      if (doneArrayItem || isEmpty(item) || item instanceof Error || isApproveNotEnough(index) || retryTimesArray[index] > MAX_RETRY_TIME) {
        return
      }
      const {
        bestSwapInfo: { platform, method, encodeExchangeArgs },
        info
      } = item
      return {
        platform,
        method,
        data: encodeExchangeArgs,
        swapDescription: info
      }
    })
    const nextIsStaticCalling = map(staticCallParamsArray, i => !isEmpty(i))
    setIsStaticCalling(nextIsStaticCalling)

    const staticCallArray = map(staticCallParamsArray, item => {
      if (isEmpty(item)) return false
      const { platform, method, data, swapDescription } = item
      return constractWithSigner.callStatic
        .swap(platform, method, data, swapDescription)
        .then(() => true)
        .catch(error => Promise.reject(error))
    })
    console.log('staticCallArray', staticCallArray)
    Promise.allSettled(staticCallArray).then(result => {
      console.log('result', result)
      const nextDoneArray = map(doneArray, (item, i) => {
        if (item || isReciveToken(i)) return true
        return Boolean(result[i]?.value)
      })
      const nextSwapInfoArray = []
      const nextRetryTimesArray = []
      const nextExcludeArray = map(excludeArray, (excludeArrayItem, index) => {
        const doneArrayItem = doneArray[index]
        const swapInfoItem = swapInfoArray[index]
        const retryItem = retryTimesArray[index]
        if (doneArrayItem) {
          nextSwapInfoArray.push(swapInfoItem)
          nextRetryTimesArray.push(retryItem)
          return excludeArrayItem
        }
        const resultItem = result[index] || {}
        if (resultItem.status === 'rejected') {
          const { bestSwapInfo } = swapInfoItem
          const [arrayItem] = getProtocolsFromBestRouter(bestSwapInfo)
          const { name } = bestSwapInfo
          const oldPlatform = excludeArrayItem[name] || [arrayItem]
          const newPlatform = oldPlatform.includes(arrayItem) ? oldPlatform : oldPlatform.concat([arrayItem])
          const nextItem = {
            ...excludeArrayItem,
            [name]: newPlatform
          }
          nextSwapInfoArray.push(undefined)
          nextRetryTimesArray.push(min([retryItem + 1, MAX_RETRY_TIME + 1]))
          if (retryItem + 1 > MAX_RETRY_TIME && isSwapping) {
            const errorMsg = errorTextOutput(resultItem.reason)
            let message = 'Swap Failed'
            if (isLossMuch(errorMsg)) {
              message = 'Swap Failed, please increase the exchange slippage'
            }
            dispatch(
              warmDialog({
                open: true,
                type: 'error',
                message
              })
            )
          }
          return nextItem
        }
        nextSwapInfoArray.push(swapInfoItem)
        nextRetryTimesArray.push(retryItem)
        return excludeArrayItem
      })

      if (!isEqual(nextSwapInfoArray, swapInfoArray)) {
        console.log('setSwapInfoArray')
        setSwapInfoArray(nextSwapInfoArray)
      }
      if (!isEqual(nextDoneArray, doneArray)) {
        console.log('nextDoneArray', nextDoneArray)
        console.log('doneArray', doneArray)
        setDoneArray(nextDoneArray)
      }
      if (!isEqual(nextExcludeArray, excludeArray)) {
        console.log('nextExcludeArray', nextExcludeArray)
        setExcludeArray(nextExcludeArray)
      }
      if (!isEqual(nextRetryTimesArray, retryTimesArray)) {
        console.log('nextRetryTimesArray', nextRetryTimesArray)
        setRetryTimesArray(nextRetryTimesArray)
      }
      // setIsSwapping(false)
      setIsStaticCalling(initBoolValues)
    })
  }, [swapInfoArray, allowances])

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <h2>Swap to single token</h2>
      </GridItem>
      <GridItem xs={12} sm={12} md={12} style={{ padding: '1rem 0' }}>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8} className={classes.tokenList}>
            <GridContainer className={classes.approveContainer}>
              {map(tokens, ({ address, amount }, index) => {
                if (amount === '0') return
                const value = values[index] || ''
                const balance = balances[index] || '0'
                const decimal = decimals[index] || BigNumber.from(0)
                const allowance = allowances[index] || BigNumber.from(0)
                const doneArrayItem = doneArray[index]
                const swapInfoArrayItem = swapInfoArray[index]
                const isFetching = !isReciveToken(index) && (isSwapInfoFetching[index] || isStaticCalling[index])
                const isSwapSuccess =
                  !isFetching &&
                  !isReciveToken(index) &&
                  ((!isApproveNotEnough(index) && doneArrayItem) || !isEmpty(swapInfoArrayItem)) &&
                  retryTimesArray[index] <= MAX_RETRY_TIME
                const isSwapError =
                  !isFetching && !isReciveToken(index) && (swapInfoArrayItem instanceof Error || retryTimesArray[index] > MAX_RETRY_TIME)

                return (
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    key={index}
                    className={classNames({
                      [classes.isSwappingContainer]: isFetching,
                      [classes.successContainer]: isSwapSuccess,
                      [classes.errorContainer]: isSwapError,
                      [classes.reciveContainer]: isReciveToken(index)
                    })}
                  >
                    <div className={classNames(classes.approveItemWrapper)}>
                      <div className={classes.approveItem}>
                        <CustomTextField
                          classes={{ root: classes.input }}
                          placeholder="approve amount"
                          maxEndAdornment
                          InputProps={{
                            startAdornment: (
                              <div className={classes.addToken} onClick={() => addToken(address)}>
                                <AddIcon fontSize="small" style={{ position: 'absolute', top: 28, left: 35 }} />
                                <img className={classes.tokenLogo} src={`./images/${address}.png`} />
                              </div>
                            )
                          }}
                          disabled={isReciveToken(index) || isSwapping || isFetching}
                          error={isErrorValue(index)}
                          value={value}
                          onChange={event => handleInputChange(event.target.value, index)}
                          onMaxClick={() => {
                            if (isReciveToken(index)) return
                            handleInputChange(toFixed(balance, decimal), index)
                          }}
                        />
                      </div>
                      {!isReciveToken(index) && (
                        <p className={classes.balanceText}>
                          balance:{' '}
                          <Loading loading={isReload} className={classes.reloadIcon}>
                            <span title={toFixed(balances[index], decimal)}>{toFixed(balances[index], decimal, 6)}</span>
                          </Loading>
                          <span style={{ float: 'right' }} className={classNames({ [classes.errorText]: isSwapError })}>
                            allowance:{' '}
                            <Loading loading={isReload} className={classes.reloadIcon}>
                              <span title={toFixed(allowance, decimal)}>{toFixed(allowance, decimal, 6)}</span>
                            </Loading>
                          </span>
                        </p>
                      )}
                      {!isReciveToken(index) && isSwapSuccess && (
                        <p className={classes.swapSuccessContainer}>
                          Swap into {toFixed(swapInfoArrayItem?.bestSwapInfo?.toTokenAmount, receiveTokenDecimals)}
                        </p>
                      )}
                      {!isReciveToken(index) && isSwapError && (
                        <p className={classes.swapErrorContainer}>
                          <span>Swap path fetch error</span>&nbsp;&nbsp;
                          <ReplayIcon className={classes.reloadIcon} fontSize="small" onClick={() => reloadSwap(index)} />
                        </p>
                      )}
                      {!isReciveToken(index) && isFetching && (
                        <p className={classes.swappingContainer}>
                          <Loading className={classes.reloadIcon} loading /> &nbsp;&nbsp;<span>Swap path fetching</span>
                        </p>
                      )}
                    </div>
                  </GridItem>
                )
              })}
            </GridContainer>
          </GridItem>
          <GridItem xs={12} sm={12} md={1} className={classes.arrow}>
            <ArrowRightAltIcon style={{ fontSize: 40 }} />
          </GridItem>
          <GridItem xs={12} sm={12} md={3} className={classes.estimateContainer}>
            <SimpleSelect
              className={classes.select}
              options={selectOptions}
              disabled={selectOptions.length <= 1 || isSwapping || isSwapInfoFetchingSome || isStaticCallingSome}
              value={receiveToken}
              onChange={v => {
                setSwapInfoArray(initValues)
                setDoneArray(initBoolValues)
                setRetryTimesArray(initNumberValues)
                setExcludeArray(initObjectValues)
                setReceiveToken(v)
              }}
            />
            <div className={classes.estimateBalance}>
              <Loading loading={isSwapInfoFetchingSome} className={classes.reloadIcon}>
                <div className={classes.textOverflow}>{toFixed(receiveAmount, receiveTokenDecimals, 6)}</div>
                <div>{receiveTokenAmount !== '0' && `+(${toFixed(receiveTokenAmount, 1, 6)})`}</div>
              </Loading>
            </div>
          </GridItem>
        </GridContainer>
      </GridItem>
      <GridItem xs={12} sm={12} md={12} className={classes.bottom}>
        <h3 className={classes.left}>
          <span>Slippage tolerance: </span>
          <span className={classes.right}>
            <CustomTextField
              classes={{ root: classes.input }}
              value={slippage}
              placeholder="Allow slippage percent"
              maxEndAdornment
              disabled={isSwapping || isSwapInfoFetchingSome || isStaticCallingSome}
              onMaxClick={() => changeSlippage('45')}
              onChange={event => {
                const { value } = event.target
                changeSlippage(value)
              }}
              // error={!isValidSlippage() || (!isStaticCallLoading && isStaticCallError)}
              error={!isValidSlippage()}
            />
          </span>
        </h3>
        <div className={classes.buttonGroup}>
          <Button
            color="colorfull"
            onClick={clickSwap}
            disabled={
              noNeedSwap ||
              isSwapInfoFetchingSome ||
              isStaticCallingSome ||
              isSwapping ||
              isSwapError() ||
              someStaticCallError() ||
              !isValidSlippage() ||
              receiveAmount.lte(0)
            }
            className={classes.okButton}
            startIcon={isSwapping ? <CachedIcon className={classes.loading} /> : null}
          >
            Swap
          </Button>
          <Button color="danger" onClick={handleClose} className={classes.cancelButton}>
            Cancel
          </Button>
        </div>
      </GridItem>
    </GridContainer>
  )
}

export default ApproveArray
