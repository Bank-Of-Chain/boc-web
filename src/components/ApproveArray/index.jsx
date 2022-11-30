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
import RefreshIcon from '@material-ui/icons/Refresh'
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
  // all tokens done
  const allDone = () => {
    console.groupCollapsed('allDone call')
    console.log('doneArray=', doneArray)
    const rs = every(doneArray, (item, index) => {
      console.log('item=', item, isReciveToken(index), isEmptyValue(index))
      // empty value means nothing to swap, set done as true
      return item || isReciveToken(index) || isEmptyValue(index)
    })
    console.groupEnd('allDone call')
    return rs
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
    console.groupCollapsed('someTokenHasValidValue call')
    console.log('values=', values)
    const rs = some(values, (item, index) => {
      console.log('item=', item, index, isReciveToken(index))
      return !isReciveToken(index) && !isEmpty(item) && item !== '0'
    })
    console.groupEnd('someTokenHasValidValue call')
    return rs
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
  // some error input value
  const someErrorValue = () => {
    return some(tokens, (item, index) => {
      return isErrorValue(index)
    })
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
    console.groupCollapsed('approveAll call')
    setIsSwapping(true)
    try {
      for (let i = 0; i < tokens.length; i++) {
        console.log('tokens=', tokens, isReciveToken(i))
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
    console.groupEnd('approveAll call')
  }

  // swap triggered by useEffect
  const swap = async () => {
    console.groupCollapsed('swap call')
    console.log('isSwapping=', isSwapping)
    if (!isSwapping) {
      return
    }
    if (isEmpty(swapInfoArray)) {
      setIsSwapping(false)
      return
    }
    console.log('swapInfoArray=', swapInfoArray)
    const someApproveNotEnough = some(tokens, (token, index) => {
      return isApproveNotEnough(index)
    })
    console.log('someApproveNotEnough=', someApproveNotEnough)
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
    console.groupEnd('swap call')
  }

  // All done, swap
  const realSwap = async () => {
    console.groupCollapsed('realSwap call')
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
    console.log('nextSwapArray=', nextSwapArray)
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
    console.groupEnd('realSwap call')
  }

  const queryBestSwapInfo = useCallback(
    async (token, value, decimal, index, exchangePlatformAdapters) => {
      console.groupCollapsed('queryBestSwapInfo call')
      console.log('excludeArray=', excludeArray)
      console.log('value=', value)
      console.log('index=', index)
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
      console.groupEnd('queryBestSwapInfo call')
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
      console.groupCollapsed('estimateWithValue call')
      if (isEmpty(receiveToken)) return
      console.log('receiveToken=', receiveToken)
      console.log('swapInfoArray=', swapInfoArray)
      console.log('newValues=', newValues)
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
      console.log('nextIsSwapInfoFetching=', nextIsSwapInfoFetching)
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
      console.groupEnd('estimateWithValue call')
    }, 1500),
    [receiveToken, exchangeManager, tokens, decimals, swapInfoArray, retryTimesArray, doneArray, queryBestSwapInfo]
  )

  const reloadSwap = index => {
    console.groupCollapsed('reloadSwap call')
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
    console.log('nextSwapInfoArray=', nextSwapInfoArray)
    console.log('nextIsSwapInfoFetching=', nextIsSwapInfoFetching)
    console.log('nextRetryTimesArray=', nextRetryTimesArray)

    setSwapInfoArray(nextSwapInfoArray)
    setIsSwapInfoFetching(nextIsSwapInfoFetching)
    setRetryTimesArray(nextRetryTimesArray)
    estimateWithValue(values, index)
    console.groupEnd('reloadSwap call')
  }

  // approve the current token with current value
  const approve = index => {
    return approveValue(index).then(reload)
  }

  const clickSwap = () => {
    console.groupCollapsed('clickSwap call')
    if (allDone()) {
      setIsSwapping(true)
      realSwap()
    } else {
      approveAll()
    }
    console.groupEnd('clickSwap call')
  }

  const resetState = () => {
    setSwapInfoArray(initValues)
    setDoneArray(initBoolValues)
    setRetryTimesArray(initNumberValues)
    setExcludeArray(initObjectValues)
  }

  const changeSlippage = value => {
    resetState()
    onSlippageChange(value)
  }

  useEffect(() => {
    if (isEmpty(userAddress)) return
    reload()
    // const timer = setInterval(reload, 10000)
    // return () => clearInterval(timer)
  }, [tokens, userAddress, exchangeManager])

  useEffect(() => {
    console.groupCollapsed('estimateWithValue useEffect call')
    console.log('isReload=', isReload)
    console.log('receiveToken=', receiveToken)
    console.log('isValidSlippage()=', isValidSlippage())
    const isSomeTokenHasValidValue = someTokenHasValidValue()
    console.log('isSomeTokenHasValidValue=', isSomeTokenHasValidValue)
    if (isReload || isEmpty(receiveToken) || !isValidSlippage() || !isSomeTokenHasValidValue) {
      console.groupEnd('estimateWithValue useEffect call')
      return
    }
    estimateWithValue(values)
    console.groupEnd('estimateWithValue useEffect call')
    return () => estimateWithValue.cancel()
  }, [isReload, values, estimateWithValue])

  useEffect(() => {
    console.groupCollapsed('swap useEffect call')
    const isAllDone = allDone()
    const isSomeTokenHasValidValue = someTokenHasValidValue()
    console.log('isAllDone=', isAllDone)
    console.log('someTokenHasValidValue()=', isSomeTokenHasValidValue)
    if (!isAllDone || !isSomeTokenHasValidValue) {
      console.groupEnd('swap useEffect call')
      return
    }
    swap()
    console.groupEnd('swap useEffect call')
  }, [doneArray])

  useEffect(() => {
    console.groupCollapsed('staticCall call')
    console.log('---staticCall---')
    console.log('swapInfoArray', swapInfoArray)
    if (
      isEmpty(exchangeManager) ||
      !someTokenHasValidValue() ||
      isEmpty(swapInfoArray) ||
      every(swapInfoArray, item => isEmpty(item))
      // every(tokens, (item, i) => !isReciveToken(i) && isApproveNotEnough(i))
    ) {
      console.log('staticCall return')
      setIsSwapInfoFetching(initBoolValues)
      // setIsSwapping(false)
      console.groupEnd('staticCall call')
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
    console.log('staticCallArray=', staticCallArray)
    Promise.allSettled(staticCallArray)
      .then(result => {
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

        console.log('nextRetryTimesArray=', nextRetryTimesArray)
        console.log('nextSwapInfoArray=', nextSwapInfoArray)
        console.log('nextDoneArray=', nextDoneArray)
        console.log('nextExcludeArray=', nextExcludeArray)
        if (!isEqual(nextSwapInfoArray, swapInfoArray)) {
          console.log('setSwapInfoArray')
          setSwapInfoArray(nextSwapInfoArray)
        }
        if (!isEqual(nextDoneArray, doneArray)) {
          console.log('nextDoneArray', nextDoneArray)
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
        setIsStaticCalling(initBoolValues)
      })
      .finally(() => {
        console.groupEnd('staticCall call')
      })
  }, [swapInfoArray, allowances])

  return (
    <div className={classes.main}>
      <div className={classes.title}>Swap to single token</div>
      <div className={classes.approveContainer}>
        <div>Swap tokens:</div>
        {map(tokens, ({ address, amount }, index) => {
          if (amount === '0' || isReciveToken(index)) return
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
          const isSwapError = !isFetching && !isReciveToken(index) && (swapInfoArrayItem instanceof Error || retryTimesArray[index] > MAX_RETRY_TIME)
          return (
            <div key={address} className={classNames(classes.approveItemWrapper)}>
              <div className={classes.approveItem}>
                <CustomTextField
                  classes={{ root: classes.input }}
                  placeholder="approve amount"
                  maxEndAdornment
                  InputProps={{
                    startAdornment: (
                      <div className={classes.addToken} onClick={() => addToken(address)}>
                        {address !== ETH_ADDRESS && <AddIcon fontSize="small" style={{ position: 'absolute', top: 28, left: 35 }} />}
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
                  Balance:{' '}
                  <Loading loading={isReload} className={classes.reloadIcon}>
                    <span title={toFixed(balances[index], decimal)}>{toFixed(balances[index], decimal, 6)}</span>
                  </Loading>
                  <span style={{ float: 'right' }}>
                    Allowance:{' '}
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
                <div className={classes.swapErrorContainer} onClick={() => reloadSwap(index)}>
                  <span>Swap path fetch error</span>&nbsp;&nbsp;
                  <RefreshIcon className={classes.reloadIcon} fontSize="small" />
                </div>
              )}
              {!isReciveToken(index) && isFetching && (
                <p className={classes.swappingContainer}>
                  <Loading className={classes.reloadIcon} loading /> &nbsp;&nbsp;<span>Swap path fetching</span>
                </p>
              )}
            </div>
          )
        })}
      </div>
      <div className={classes.estimateContainer}>
        <div className={classes.estimateTitle}>To receive estimated:</div>
        <GridContainer>
          <GridItem xs={4} sm={4} md={4}>
            <SimpleSelect
              options={selectOptions}
              disabled={selectOptions.length <= 1 || isSwapping || isSwapInfoFetchingSome || isStaticCallingSome}
              value={receiveToken}
              onChange={v => {
                resetState()
                setReceiveToken(v)
              }}
            />
          </GridItem>
          <GridItem xs={8} sm={8} md={8} className={classes.estimateBalance}>
            <Loading loading={isSwapInfoFetchingSome} className={classes.reloadIcon}>
              <div className={classes.textOverflow}>{toFixed(receiveAmount, receiveTokenDecimals, 6)} from token swap</div>
              <div>{receiveTokenAmount !== '0' && `+${toFixed(receiveTokenAmount, 1, 6)}`} from withdrawal</div>
            </Loading>
          </GridItem>
        </GridContainer>
      </div>
      <GridContainer className={classes.slippage}>
        <GridItem xs={4} sm={4} md={4} className={classes.slippageTitlte}>
          Slippage tolerance:
        </GridItem>
        <GridItem xs={8} sm={8} md={8}>
          <CustomTextField
            value={slippage}
            placeholder="Allow slippage percent"
            maxEndAdornment
            disabled={isSwapping || isSwapInfoFetchingSome || isStaticCallingSome}
            onMaxClick={() => changeSlippage('45')}
            onChange={event => {
              const { value } = event.target
              changeSlippage(value)
            }}
            error={!isValidSlippage()}
          />
        </GridItem>
      </GridContainer>
      <GridContainer className={classes.buttonGroup}>
        <GridItem xs={4} sm={4} md={4}>
          <Button color="danger" onClick={handleClose} className={classes.cancelButton}>
            Cancel
          </Button>
        </GridItem>
        <GridItem xs={8} sm={8} md={8} className={classes.okWrapper}>
          <Button
            color="colorful"
            onClick={clickSwap}
            disabled={
              noNeedSwap ||
              isSwapInfoFetchingSome ||
              isStaticCallingSome ||
              isSwapping ||
              isSwapError() ||
              someStaticCallError() ||
              !isValidSlippage() ||
              receiveAmount.lte(0) ||
              someErrorValue()
            }
            className={classes.okButton}
            startIcon={isSwapping ? <CachedIcon className={classes.loading} /> : null}
          >
            Swap
          </Button>
        </GridItem>
      </GridContainer>
    </div>
  )
}

export default ApproveArray
