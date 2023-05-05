import React, { useCallback, useState, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import CustomTextField from '@/components/CustomTextField'
import Loading from '@/components/LoadingComponent'
import RefreshIcon from '@material-ui/icons/Refresh'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import SimpleSelect from '@/components/SimpleSelect'

// === Hooks === //
import useErc20Token from '@/hooks/useErc20Token'

// === Utils === //
import * as ethers from 'ethers'
import uniq from 'lodash/uniq'
import isNil from 'lodash/isNil'
import assign from 'lodash/assign'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
import { toFixed } from '@/helpers/number-format'
import * as pfUtils from 'piggy-finance-utils'
import BN from 'bignumber.js'
import { getProtocolsFromBestRouter } from '@/helpers/swap-util'

// === Utils === //
import { ONEINCH_V5, PARASWAP } from '@/helpers/swap-util'

// === Constants === //
import { ONE_INCH_ROUTER, PARA_ROUTER, PARA_TRANSFER_PROXY } from '@/constants'
import { ETH_ADDRESS } from '@/constants/tokens'
import { IERC20_ABI, EXCHANGE_EXTRA_PARAMS, ORACLE_ADDITIONAL_SLIPPAGE } from '@/constants'

// === Styles === //
import styles from './style'
let sycIndex = 0

const { getBestSwapInfo } = pfUtils
const { Contract, BigNumber } = ethers
const useStyles = makeStyles(styles)
const MAX_RETRY_TIME = 2
const BN_0 = BigNumber.from('0')

const exchangePlatformAdapters = {
  oneInchV5: ONE_INCH_ROUTER,
  paraswap: PARA_TRANSFER_PROXY
}

const TokenItem = (props, ref) => {
  const classes = useStyles()
  const {
    token = {},
    userAddress,
    userProvider,
    slippage,
    receiveToken,
    EXCHANGE_AGGREGATOR_ABI,
    style,
    onChange,
    onStaticCallFinish,
    disabled
  } = props
  const { address, symbol } = token

  const [isReload, setIsReload] = useState(false)
  const [value, setValue] = useState('')
  const [allowances, setAllowances] = useState(BN_0)
  const [exclude, setExclude] = useState({})
  const [swapInfo, setSwapInfo] = useState(undefined)
  const [isSwapInfoFetching, setIsSwapInfoFetching] = useState(false)
  const [isStaticCalling, setIsStaticCalling] = useState(false)
  const [done, setDone] = useState(false)
  const [retryTimes, setRetryTimes] = useState(0)
  const [isApproving, setIsApproving] = useState(false)

  const { decimals: receiveDecimals } = useErc20Token(receiveToken, userProvider)

  const { balance, decimals: tokenDecimals, approve, queryAllowance } = useErc20Token(address, userProvider)

  const decimals = useMemo(() => BigNumber.from(10).pow(tokenDecimals), [tokenDecimals])

  const receiveTokenDecimals = useMemo(() => BigNumber.from(10).pow(receiveDecimals), [receiveDecimals])

  const isReciveToken = token.address === receiveToken
  const isFetching = !isReciveToken && (isSwapInfoFetching || isStaticCalling)
  const isOverMaxRetry = retryTimes > MAX_RETRY_TIME

  const { approveAddress, callAddress } = useMemo(() => {
    if (isEmpty(swapInfo)) return {}

    const {
      bestSwapInfo: { name }
    } = swapInfo

    if (name === ONEINCH_V5) {
      return {
        approveAddress: ONE_INCH_ROUTER,
        callAddress: ONE_INCH_ROUTER
      }
    } else if (name === PARASWAP) {
      return {
        approveAddress: PARA_TRANSFER_PROXY,
        callAddress: PARA_ROUTER
      }
    }

    return {}
  }, [swapInfo])

  const options = [
    {
      label: symbol,
      value: address,
      img: `./images/${address}.png`
    }
  ]

  // console.groupCollapsed(`init state:${address}:${sycIndex++}`)
  // console.log('isReload=', isReload)
  // console.log('value=', value)
  // console.log('balance=', balance.toString())
  // console.log('decimals=', decimals.toString())
  // console.log('allowances=', allowances.toString())
  // console.log('exclude=', exclude)
  // console.log('swapInfo=', swapInfo)
  // console.log('isSwapInfoFetching=', isSwapInfoFetching)
  // console.log('isStaticCalling=', isStaticCalling)
  // console.log('done=', done)
  // console.log('retryTimes=', retryTimes)
  // console.log('isApproving=', isApproving)
  // console.log('isReciveToken=', isReciveToken)
  // console.log('userAddress=', userAddress)
  // console.log('slippage=', slippage)
  // console.log('token=', token)
  // console.log('exchangePlatformAdapters=', exchangePlatformAdapters)
  // console.log('receiveTokenDecimals=', receiveTokenDecimals.toString())
  // console.groupEnd(`init state:${address}:${sycIndex++}`)

  /**
   *
   */
  const resetState = useCallback(() => {
    setIsReload(false)
    setExclude({})
    setSwapInfo(undefined)
    setIsSwapInfoFetching(false)
    setIsStaticCalling(false)
    setDone(false)
    setRetryTimes(0)
    setIsApproving(false)
    setTimeout(() => {
      onChange()
    })
  }, [onChange])

  /**
   *
   */
  const isApproveEnough = useCallback(() => {
    if (token.address === ETH_ADDRESS || isReciveToken) return true
    try {
      const nextValue = new BN(value).multipliedBy(decimals.toString())
      const result = nextValue.lte(allowances)
      return result
    } catch (error) {
      return false
    }
  }, [token, value, allowances, decimals, isReciveToken])

  const staticCall = useCallback(
    debounce(() => {
      console.groupCollapsed(`staticCall call:${address}:${++sycIndex}`)
      console.log('swapInfo=', swapInfo)
      const signer = userProvider.getSigner()

      const {
        bestSwapInfo: { encodeExchangeArgs },
        info
      } = swapInfo

      setIsStaticCalling(true)
      setIsSwapInfoFetching(false)
      onChange()
      signer
        .call({
          to: callAddress,
          data: encodeExchangeArgs
        })
        .then(() => {
          console.log('staticCall success')
          console.groupEnd(`staticCall call:${address}:${sycIndex}`)
          setDone(true)
          onStaticCallFinish(true)
        })
        .catch(error => {
          console.log('staticCall error', error)
          console.groupEnd(`staticCall call:${address}:${sycIndex}`)
          const { bestSwapInfo } = swapInfo
          const [arrayItem] = getProtocolsFromBestRouter(bestSwapInfo)
          const { name } = bestSwapInfo
          const oldPlatform = exclude[name] || [arrayItem]
          const newPlatform = oldPlatform.includes(arrayItem) ? oldPlatform : oldPlatform.concat([arrayItem])
          const nextExclude = {
            ...exclude,
            [name]: newPlatform
          }
          setExclude(nextExclude)
          setSwapInfo(undefined)
          console.log(`Retry ${retryTimes + 1} times`)
          setRetryTimes(retryTimes + 1)
          setDone(false)
          setIsSwapInfoFetching(retryTimes + 1 <= MAX_RETRY_TIME)
          if (retryTimes + 1 > MAX_RETRY_TIME) {
            onStaticCallFinish(false, error)
          }
        })
        .finally(() => {
          setIsStaticCalling(false)
          onChange()
        })
    }, 500),
    [userProvider, swapInfo, onChange, exclude, retryTimes, onStaticCallFinish, EXCHANGE_AGGREGATOR_ABI, address, callAddress]
  )

  // item fetch swap path failed
  const isSwapError = !isFetching && !isReciveToken && isOverMaxRetry

  // Check if value is gt balance, or lt 1 decimal
  const isErrorValue = useCallback(() => {
    if (!value) {
      return false
    }
    if (!decimals) {
      return false
    }
    const nextFromValueString = new BN(value).multipliedBy(decimals.toString())
    return !isReciveToken && !isEmpty(value) && (nextFromValueString.gt(balance) || nextFromValueString.toFixed().indexOf('.') !== -1)
  }, [value, decimals, balance, isReciveToken])

  // Check if value is empty
  const isEmptyValue = useCallback(() => {
    return !isReciveToken && (isEmpty(value) || Number(value) === 0)
  }, [isReciveToken, value])

  // check the slippage is valid or not
  const isValidSlippage = useCallback(() => {
    if (isNaN(slippage)) return false
    if (slippage < 0.01 || slippage > 45) return false
    return true
  }, [slippage])

  /**
   *
   * @param {*} value
   * @returns
   */
  const handleInputChange = value => {
    const num = Number(value)
    if (isNaN(num) || num < 0) {
      return
    }
    setValue(value)
    setSwapInfo(undefined)
    setIsStaticCalling(false)
    setRetryTimes(0)
    setExclude({})
    setDone(false)
    setTimeout(() => {
      onChange()
    })
  }

  /**
   *
   */
  const reload = useCallback(async () => {
    if (isEmpty(approveAddress)) return
    // console.groupCollapsed(`reload call:${address}:${++sycIndex}`)
    setIsReload(true)

    const nextAllowance = (await queryAllowance(userAddress, approveAddress).catch(() => BN_0)).toString()
    setAllowances(nextAllowance)
    setIsReload(false)
    // console.groupEnd(`reload call:${address}:${sycIndex}`)
  }, [userAddress, queryAllowance, approveAddress])

  /**
   *
   */
  const reloadSwap = () => {
    // console.groupCollapsed(`reloadSwap call:${address}:${++sycIndex}`)
    setSwapInfo(undefined)
    setIsSwapInfoFetching(true)
    setRetryTimes(0)
    onStaticCallFinish(undefined)
    // console.groupEnd(`reloadSwap call:${address}:${sycIndex}`)
  }

  /**
   *
   */
  const queryBestSwapInfo = useCallback(async () => {
    if (isNil(decimals) || isEmptyValue() || value === '0' || isReciveToken) {
      return
    }
    // console.groupCollapsed(`queryBestSwapInfo call:${address}:${++sycIndex}`)
    // console.log('exclude=', exclude)
    // console.log('value=', value)
    // console.log('swapInfo=', swapInfo)
    const nextFromValueString = new BN(value).multipliedBy(decimals.toString()).toFixed()
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
    console.groupCollapsed(`fetch best swap path: ${fromToken.address}-${toToken.address}:${swapAmount}:${++sycIndex}`)
    let nextExchangeExtraParams = assign({}, EXCHANGE_EXTRA_PARAMS, isEmpty(exchangePlatformAdapters.testAdapter) ? {} : {})
    if (!isEmpty(exclude)) {
      console.log(`exclude=`, exclude)
      const { oneInchV5 = [], paraswap = [] } = exclude
      nextExchangeExtraParams = assign({}, nextExchangeExtraParams, {
        oneInchV5: {
          ...nextExchangeExtraParams.oneInchV5,
          excludeProtocols: uniq(oneInchV5.concat(nextExchangeExtraParams.oneInchV5.excludeProtocols))
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
    console.groupEnd(`fetch best swap path: ${fromToken.address}-${toToken.address}:${swapAmount}:${sycIndex}`)
    if (isEmpty(bestSwapInfo)) {
      throw new Error('fetch error')
    }
    // console.groupEnd(`queryBestSwapInfo call:${sycIndex}`)
    return {
      bestSwapInfo,
      info: {
        amount: swapAmount,
        srcToken: token.address,
        dstToken: receiveToken,
        receiver: userAddress
      }
    }
  }, [token, value, decimals, exchangePlatformAdapters, exclude, receiveToken, isReciveToken, slippage, isEmptyValue, userAddress, userProvider])

  /**
   *
   */
  const estimateWithValue = useCallback(
    debounce(async () => {
      if (isEmptyValue()) {
        onChange()
        return
      }
      // console.groupCollapsed(`estimateWithValue call:${address}:${++sycIndex}`)
      setIsSwapInfoFetching(true)
      onChange()
      await queryBestSwapInfo()
        .then(nextSwapInfo => {
          // console.log('estimateWithValue call success')
          // console.groupEnd(`estimateWithValue call:${address}:${sycIndex}`)
          setSwapInfo(nextSwapInfo)
          if (!isApproveEnough()) {
            setIsSwapInfoFetching(false)
          }
        })
        .catch(() => {
          // console.log('estimateWithValue call error')
          // console.groupEnd(`estimateWithValue call:${address}:${sycIndex}`)
          if (isOverMaxRetry) {
            setIsSwapInfoFetching(false)
          } else {
            setRetryTimes(retryTimes + 1)
            setIsSwapInfoFetching(retryTimes + 1 <= MAX_RETRY_TIME)
          }
        })
        .finally(() => {
          onChange()
        })
    }, 500),
    [retryTimes, queryBestSwapInfo, onChange, isApproveEnough, isEmptyValue]
  )

  const isGetSwapInfoSuccess = !isSwapInfoFetching && !isEmpty(swapInfo) && !isOverMaxRetry

  // staticcall success or getswapinfo success
  const isSwapSuccess =
    !isFetching && !isReciveToken && ((isApproveEnough() && done) || (!isApproveEnough() && !isEmpty(swapInfo))) && !isOverMaxRetry

  useEffect(resetState, [receiveToken, slippage])

  useEffect(() => {
    setValue(toFixed(token.amount, decimals))
  }, [token, decimals])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    const isValidSlippageValue = isValidSlippage()
    // console.groupCollapsed(`estimateWithValue useEffect call:${address}:${++sycIndex}`)
    // console.log('isReload=', isReload)
    // console.log('swapInfo=', swapInfo)
    // console.log('isValidSlippage()=', isValidSlippageValue)
    // console.log('isGetSwapInfoSuccess=', isGetSwapInfoSuccess)
    if (
      isReciveToken ||
      isReload ||
      !isValidSlippageValue ||
      isEmpty(exchangePlatformAdapters) ||
      isGetSwapInfoSuccess ||
      isOverMaxRetry ||
      isErrorValue() ||
      isEmptyValue()
    ) {
      // console.log('estimateWithValue useEffect return')
      // console.groupEnd(`estimateWithValue useEffect call:${address}:${sycIndex}`)
      return
    }
    // console.groupEnd(`estimateWithValue useEffect call:${address}:${sycIndex}`)
    estimateWithValue()
    return () => estimateWithValue.cancel()
  }, [
    isReload,
    value,
    swapInfo,
    estimateWithValue,
    retryTimes,
    isSwapInfoFetching,
    isGetSwapInfoSuccess,
    exchangePlatformAdapters,
    isReciveToken,
    isOverMaxRetry,
    isEmptyValue,
    isErrorValue,
    isValidSlippage
  ])

  useEffect(() => {
    const isApproveEnoughValue = isApproveEnough()
    // console.groupCollapsed(`staticCall useEffect call:${address}:${++sycIndex}`)
    // console.log('done=', done)
    // console.log('retryTimes=', retryTimes)
    // console.log('isApproveEnoughValue=', isApproveEnoughValue)
    // console.log('swapInfo=', swapInfo)
    // console.log('isStaticCalling=', isStaticCalling)
    // console.log('isOverMaxRetry=', isOverMaxRetry)
    // console.log('isReciveToken=', isReciveToken)
    if (
      isReciveToken ||
      done ||
      isEmpty(swapInfo) ||
      !isApproveEnoughValue ||
      isStaticCalling ||
      isOverMaxRetry ||
      isErrorValue() ||
      isEmptyValue()
    ) {
      // console.log('staticCall useEffect return')
      // console.groupEnd(`staticCall useEffect call:${address}:${sycIndex}`)
      return
    }
    // console.groupEnd(`staticCall useEffect call:${address}:${sycIndex}`)
    staticCall()
  }, [done, value, retryTimes, swapInfo, staticCall, isStaticCalling, isApproveEnough, isEmptyValue, isErrorValue, isOverMaxRetry, isReciveToken])

  useImperativeHandle(
    ref,
    () => {
      return {
        approve: callback =>
          approve(approveAddress, BigNumber.from(new BN(value).multipliedBy(decimals.toString()).toFixed()), callback).then(reload),
        value,
        tokenAddress: token.address,
        isApproving,
        isFetching,
        swapInfo,
        done,
        isApproveEnough,
        retryTimes,
        isErrorValue,
        isEmptyValue
      }
    },
    [token, approve, isEmptyValue, isErrorValue, done, swapInfo, isFetching, isApproving, value, reload, decimals, isApproveEnough, retryTimes]
  )

  return (
    <div key={address} className={classNames(classes.approveItemWrapper)} style={style}>
      <GridContainer spacing={2} justify="center">
        <GridItem xs={4} sm={4} md={4} lg={4}>
          <SimpleSelect disabled options={options} value={address} />
        </GridItem>
        <GridItem xs={8} sm={8} md={8} lg={8}>
          <CustomTextField
            classes={{ root: classes.input }}
            value={value}
            onChange={event => handleInputChange(event.target.value)}
            placeholder="approve amount"
            maxEndAdornment
            onMaxClick={() => handleInputChange(toFixed(balance, decimals))}
            disabled={disabled || isReciveToken || isFetching}
            error={isErrorValue()}
          />
        </GridItem>
      </GridContainer>
      {!isReciveToken && (
        <p className={classes.balanceText}>
          Balance:{' '}
          <Loading loading={isReload} className={classes.reloadIcon}>
            <span title={toFixed(balance, decimals)}>{toFixed(balance, decimals, 6)}</span>
          </Loading>
          <span style={{ float: 'right' }}>
            Allowance:{' '}
            <Loading loading={isReload} className={classes.reloadIcon}>
              <span title={toFixed(allowances, decimals)}>{toFixed(allowances, decimals, 6)}</span>
            </Loading>
          </span>
        </p>
      )}
      {!isReciveToken && isSwapSuccess && (
        // <p className={classes.swapSuccessContainer}>
        //   {`Swap into ${toFixed(swapInfo?.bestSwapInfo?.toTokenAmount, receiveTokenDecimals)} (done: ${done})`}
        // </p>
        <p className={classes.swapSuccessContainer}>{`Swap into ${toFixed(swapInfo?.bestSwapInfo?.toTokenAmount, receiveTokenDecimals)}`}</p>
      )}
      {!isReciveToken && isSwapError && (
        <div className={classes.swapErrorContainer} onClick={reloadSwap}>
          <span>Swap path fetch error</span>&nbsp;&nbsp;
          <RefreshIcon className={classes.reloadIcon} fontSize="small" />
        </div>
      )}
      {!isReciveToken && isFetching && (
        <p className={classes.swappingContainer}>
          <Loading className={classes.reloadIcon} loading /> &nbsp;&nbsp;
          {/* <span>{`Swap path fetching (retryTimes: ${retryTimes}, fetching: ${isSwapInfoFetching}, calling: ${isStaticCalling})`}</span> */}
          <span>Swap path fetching</span>
        </p>
      )}
    </div>
  )
}

export default forwardRef(TokenItem)
