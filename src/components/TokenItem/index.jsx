/* eslint-disable */
import React, { useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import CustomTextField from '@/components/CustomTextField'
import Loading from '@/components/LoadingComponent'
import AddIcon from '@material-ui/icons/Add'
import RefreshIcon from '@material-ui/icons/Refresh'

// === Utils === //
import * as ethers from 'ethers'
import uniq from 'lodash/uniq'
import isNil from 'lodash/isNil'
import assign from 'lodash/assign'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
import { addToken } from '@/helpers/wallet'
import { toFixed } from '@/helpers/number-format'
import { getBestSwapInfo } from 'piggy-finance-utils'
import BN from 'bignumber.js'
import { getProtocolsFromBestRouter } from '@/helpers/swap-util'

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
let sycIndex = 0

const { Contract, BigNumber } = ethers
const useStyles = makeStyles(styles)
const MAX_RETRY_TIME = 2
const BN_0 = BigNumber.from('0')

const TokenItem = (props, ref) => {
  const classes = useStyles()
  const {
    token = {},
    userAddress,
    userProvider,
    slippage,
    receiveToken,
    exchangePlatformAdapters,
    exchangeManager,
    receiveTokenDecimals,
    EXCHANGE_AGGREGATOR_ABI,
    style,
    disabled,
    onChange,
    onStaticCallFinish
  } = props
  const { address } = token

  const [isReload, setIsReload] = useState(false)
  const [value, setValue] = useState('')
  const [balance, setBalance] = useState(BN_0)
  const [decimals, setDecimals] = useState(0)
  const [allowances, setAllowances] = useState(BN_0)
  const [exclude, setExclude] = useState({})
  const [swapInfo, setSwapInfo] = useState(undefined)
  const [isSwapInfoFetching, setIsSwapInfoFetching] = useState(false)
  const [isStaticCalling, setIsStaticCalling] = useState(false)
  const [done, setDone] = useState(false)
  const [retryTimes, setRetryTimes] = useState(0)
  const [isApproving, setIsApproving] = useState(false)

  const isReciveToken = token.address === receiveToken
  const isFetching = !isReciveToken && (isSwapInfoFetching || isStaticCalling)
  const isOverMaxRetry = retryTimes > MAX_RETRY_TIME

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
  // console.log('exchangeManager=', exchangeManager)
  // console.log('receiveTokenDecimals=', receiveTokenDecimals.toString())
  // console.groupEnd(`init state:${address}:${sycIndex++}`)

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
  }, [])

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
      const constract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
      const signer = userProvider.getSigner()
      const constractWithSigner = constract.connect(signer)

      const {
        bestSwapInfo: { platform, method, encodeExchangeArgs },
        info
      } = swapInfo

      setIsStaticCalling(true)
      setIsSwapInfoFetching(false)
      onChange()
      constractWithSigner.callStatic
        .swap(platform, method, encodeExchangeArgs, info)
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
          onStaticCallFinish(false, error)
        })
        .finally(() => {
          setIsStaticCalling(false)
          onChange()
        })
    }, 500),
    [userProvider, swapInfo, onChange, exclude, retryTimes, onStaticCallFinish]
  )

  const approve = async () => {
    // ETH no need approve
    if (isEmpty(token) || isNil(value) || value === '0') return
    // console.groupCollapsed(`approve call:${address}:${++sycIndex}`)
    const signer = userProvider.getSigner()
    const contract = new Contract(address, IERC20_ABI, userProvider)
    const contractWithUser = contract.connect(signer)
    let nextValue
    try {
      nextValue = BigNumber.from(new BN(value).multipliedBy(decimals.toString()).toFixed())
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
    // console.groupEnd(`approve call:${address}:${sycIndex}`)
  }

  // item fetch swap path failed
  const isSwapError = !isFetching && !isReciveToken && isOverMaxRetry

  // Check if value is gt balance, or lt 1 decimal
  const isErrorValue = () => {
    if (!value) {
      return false
    }
    if (!decimals) {
      return false
    }
    const nextFromValueString = new BN(value).multipliedBy(decimals.toString())
    return !isReciveToken && !isEmpty(value) && (nextFromValueString.gt(balance) || nextFromValueString.toFixed().indexOf('.') !== -1)
  }

  // Check if value is empty
  const isEmptyValue = () => {
    return !isReciveToken && (isEmpty(value) || Number(value) === 0)
  }

  // check the slippage is valid or not
  const isValidSlippage = () => {
    if (isNaN(slippage)) return false
    if (slippage < 0.01 || slippage > 45) return false
    return true
  }

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

  const reload = useCallback(async () => {
    const { address } = token
    // console.groupCollapsed(`reload call:${address}:${++sycIndex}`)
    setIsReload(true)

    const contract = new Contract(address, IERC20_ABI, userProvider)
    const nextAllowance = (await contract.allowance(userAddress, exchangeManager).catch(() => BN_0)).toString()
    const nextBalance = (await contract.balanceOf(userAddress).catch(() => BN_0)).toString()
    const nextDecimals = BigNumber.from(10).pow(await contract.decimals().catch(() => BN_0))

    setBalance(nextBalance)
    setDecimals(nextDecimals)
    setAllowances(nextAllowance)
    setIsReload(false)
    // console.groupEnd(`reload call:${address}:${sycIndex}`)
  }, [token, userAddress, exchangeManager])

  const reloadSwap = () => {
    // console.groupCollapsed(`reloadSwap call:${address}:${++sycIndex}`)
    setSwapInfo(undefined)
    setIsSwapInfoFetching(true)
    setRetryTimes(0)
    onStaticCallFinish(undefined)
    // console.groupEnd(`reloadSwap call:${address}:${sycIndex}`)
  }

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
      const { oneInchV4 = [], paraswap = [] } = exclude
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
  }, [token, value, decimals, exchangePlatformAdapters, exclude, receiveToken, isReciveToken, slippage])

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
    [exchangeManager, token, decimals, retryTimes, queryBestSwapInfo, onChange]
  )

  useEffect(resetState, [receiveToken, slippage])

  useEffect(() => {
    setValue(toFixed(token.amount, decimals))
  }, [token, decimals.toString()])

  useEffect(() => {
    reload()
    // TODO: 待开启
    // const timer = setInterval(reload, 3000)
    // return () => clearInterval(timer)
  }, [reload])

  const isGetSwapInfoSuccess = !isSwapInfoFetching && !isEmpty(swapInfo) && !isOverMaxRetry

  // staticcall success or getswapinfo success
  const isSwapSuccess =
    !isFetching && !isReciveToken && ((isApproveEnough() && done) || (!isApproveEnough() && !isEmpty(swapInfo))) && !isOverMaxRetry

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
  }, [isReload, value, swapInfo, estimateWithValue, retryTimes, isSwapInfoFetching])

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
  }, [done, value, retryTimes, swapInfo, staticCall, isStaticCalling, isApproveEnough])

  useImperativeHandle(ref, () => {
    return {
      approve: () => approve().then(reload),
      value,
      isApproving,
      isFetching,
      swapInfo,
      done,
      isApproveEnough,
      retryTimes,
      isErrorValue,
      isEmptyValue
    }
  })

  return (
    <div key={address} className={classNames(classes.approveItemWrapper)} style={style}>
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
          disabled={disabled || isReciveToken || isFetching}
          error={isErrorValue()}
          value={value}
          onChange={event => handleInputChange(event.target.value)}
          onMaxClick={() => handleInputChange(toFixed(balance, decimals))}
        />
      </div>
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
