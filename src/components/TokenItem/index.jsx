/* eslint-disable */
import React, { useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'

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
import { addToken } from '@/helpers/wallet'
import { toFixed } from '@/helpers/number-format'
import { getBestSwapInfo } from 'piggy-finance-utils'
import BN from 'bignumber.js'
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
    EXCHANGE_AGGREGATOR_ABI
  } = props
  const { address, amount } = token

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

  const isApproveEnough = () => {}

  const isReciveToken = token.address === receiveToken
  const isFetching = !isReciveToken && (isSwapInfoFetching || isStaticCalling)
  const isSwapSuccess = !isFetching && !isReciveToken && ((isApproveEnough() && done) || !isEmpty(swapInfo)) && retryTimes <= MAX_RETRY_TIME

  console.groupCollapsed(`init state:${address}`)
  console.log('isReload=', isReload)
  console.log('value=', value)
  console.log('balance=', balance.toString())
  console.log('decimals=', decimals.toString())
  console.log('allowances=', allowances.toString())
  console.log('exclude=', exclude)
  console.log('swapInfo=', swapInfo)
  console.log('isSwapInfoFetching=', isSwapInfoFetching)
  console.log('isStaticCalling=', isStaticCalling)
  console.log('done=', done)
  console.log('retryTimes=', retryTimes)
  console.log('isApproving=', isApproving)
  console.log('isReciveToken=', isReciveToken)
  console.log('userAddress=', userAddress)
  console.log('slippage=', slippage)
  console.log('token=', token)
  console.log('exchangePlatformAdapters=', exchangePlatformAdapters)
  console.log('exchangeManager=', exchangeManager)
  console.log('receiveTokenDecimals=', receiveTokenDecimals.toString())
  console.groupEnd(`init state:${address}`)

  const resetState = useCallback(() => {
    console.groupCollapsed(`resetState call:${address}`)
    setIsReload(false)
    setValue(token.amount)
    setBalance(BN_0)
    setDecimals(0)
    setAllowances(BN_0)
    setExclude({})
    setSwapInfo(undefined)
    setIsSwapInfoFetching(false)
    setIsStaticCalling(false)
    setDone(false)
    setRetryTimes(0)
    setIsApproving(false)
    console.groupEnd(`resetState call:${address}`)
  }, [])

  const staticCall = () => {
    console.groupCollapsed(`staticCall call:${address}`)
    console.log('swapInfo=', swapInfo)
    if (isEmpty(exchangeManager) || isEmpty(swapInfo)) {
      console.log('staticCall return')
      setIsSwapInfoFetching(false)
      // setIsSwapping(false)
      return
    }
    const constract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
    const signer = userProvider.getSigner()
    const constractWithSigner = constract.connect(signer)

    if (done || isEmpty(swapInfo) || swapInfo instanceof Error || isApproveEnough() || retryTimes > MAX_RETRY_TIME) {
      console.groupEnd(`staticCall call:${address}`)
      return
    }
    const {
      bestSwapInfo: { platform, method, encodeExchangeArgs },
      info
    } = swapInfo

    setIsStaticCalling(true)
    constractWithSigner.callStatic
      .swap(platform, method, encodeExchangeArgs, info)
      .then(() => {
        setDone(true)
        setIsStaticCalling(false)
      })
      .finally(() => {
        setIsStaticCalling(false)
      })
    console.groupEnd(`staticCall call:${address}`)
  }

  const approve = async () => {
    // ETH no need approve
    if (isEmpty(token) || isNil(value) || value === '0') return
    console.groupCollapsed(`approve call:${address}`)
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
    console.groupEnd(`approve call:${address}`)
  }

  // has some item fetch swap path failed
  const isSwapError = () => {
    return !isFetching && !isReciveToken && (swapInfo instanceof Error || retryTimes > MAX_RETRY_TIME)
  }

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

  // check the slippage is valid or not
  const isValidSlippage = () => {
    if (isNaN(slippage)) return false
    if (slippage < 0.01 || slippage > 45) return false
    return true
  }

  const reload = useCallback(async () => {
    if (isEmpty(token) || isEmpty(exchangeManager) || isEmpty(userAddress)) {
      return
    }
    const { address, amount } = token
    setIsReload(true)
    console.groupCollapsed(`reload call:${address}`)
    let nextAllowance, nextBalance, nextDecimals, nextValue
    if (address === ETH_ADDRESS) {
      nextDecimals = BigNumber.from(10).pow(18)
      nextAllowance = '0'
      nextBalance = (await userProvider.getBalance(userAddress).catch(() => BN_0)).toString()
      nextValue = value || toFixed(amount, nextDecimals)
    } else {
      const contract = new Contract(address, IERC20_ABI, userProvider)
      nextAllowance = (await contract.allowance(userAddress, exchangeManager).catch(() => BN_0)).toString()
      nextBalance = (await contract.balanceOf(userAddress).catch(() => BN_0)).toString()
      nextDecimals = BigNumber.from(10).pow(await contract.decimals().catch(() => BN_0))
      nextValue = value || toFixed(amount, nextDecimals)
    }

    console.groupEnd(`reload call:${address}`)
    setValue(nextValue)
    setBalance(nextBalance)
    setDecimals(nextDecimals)
    setAllowances(nextAllowance)
    setIsReload(false)
  }, [token, userAddress, value, exchangeManager])

  const reloadSwap = () => {}

  const queryBestSwapInfo = useCallback(async () => {
    console.groupCollapsed('queryBestSwapInfo call')
    console.log('exclude=', exclude)
    console.log('value=', value)
    console.log('swapInfo=', swapInfo)
    if (!isEmpty(swapInfo) && !(swapInfo instanceof Error)) return swapInfo
    if (isNil(decimals) || isNil(value) || value === '0' || token.address === receiveToken) return
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
    console.groupCollapsed('fetch best swap path: ' + fromToken.address + '-' + toToken.address)
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
    console.groupEnd('fetch best swap path: ' + fromToken.address + '-' + toToken.address)
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
  }, [token, value, decimals, exchangePlatformAdapters, exclude, receiveToken, slippage])

  const estimateWithValue = useCallback(
    debounce(async () => {
      if (isEmpty(receiveToken)) return
      console.groupCollapsed(`estimateWithValue call:${address}`)
      console.log('receiveToken=', receiveToken)
      console.log('swapInfo=', swapInfo)
      if (isEmpty(swapInfo)) {
        setIsSwapInfoFetching(true)
        await queryBestSwapInfo()
          .then(nextSwapInfo => {
            setSwapInfo(nextSwapInfo)
          })
          .finally(() => {
            setIsSwapInfoFetching(false)
          })
      }
      console.groupEnd(`estimateWithValue call:${address}`)
    }, 1500),
    [exchangeManager, token, decimals, swapInfo, retryTimes, done, queryBestSwapInfo]
  )
  useEffect(resetState, [receiveToken])

  useEffect(() => {
    if (isEmpty(userAddress)) return
    reload()
    // const timer = setInterval(reload, 10000)
    // return () => clearInterval(timer)
  }, [token, userAddress, exchangeManager, receiveToken])

  useEffect(() => {
    console.groupCollapsed('estimateWithValue useEffect call')
    const isValidSlippageValue = isValidSlippage()
    if (isReload || isEmpty(receiveToken) || !isValidSlippageValue || isEmpty(exchangePlatformAdapters)) {
      console.log('estimateWithValue useEffect call return')
      console.groupEnd('estimateWithValue useEffect call')
      return
    }
    console.log('isReload=', isReload)
    console.log('receiveToken=', receiveToken)
    console.log('isValidSlippage()=', isValidSlippageValue)
    estimateWithValue()
    console.groupEnd('estimateWithValue useEffect call')
    return () => estimateWithValue.cancel()
  }, [isReload, value, estimateWithValue])

  // useEffect(() => {
  //   resetState()
  //   estimateWithValue()
  // }, [resetState, estimateWithValue])

  // useEffect(() => staticCall(), [staticCall])

  useImperativeHandle(ref, () => {
    return {
      approve,
      value,
      isApproving,
      isFetching,
      swapInfo,
      done
    }
  })

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
          disabled={isReciveToken || isFetching}
          error={isErrorValue()}
          value={value}
          onChange={event => setValue(event.target.value)}
          onMaxClick={() => {
            if (isReciveToken) return
            setValue(toFixed(balance, decimals))
          }}
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
        <p className={classes.swapSuccessContainer}>Swap into {toFixed(swapInfo?.bestSwapInfo?.toTokenAmount, receiveTokenDecimals)}</p>
      )}
      {!isReciveToken && isSwapError() && (
        <div className={classes.swapErrorContainer} onClick={reloadSwap}>
          <span>Swap path fetch error</span>&nbsp;&nbsp;
          <RefreshIcon className={classes.reloadIcon} fontSize="small" />
        </div>
      )}
      {!isReciveToken && isFetching && (
        <p className={classes.swappingContainer}>
          <Loading className={classes.reloadIcon} loading /> &nbsp;&nbsp;<span>Swap path fetching</span>
        </p>
      )}
    </div>
  )
}

export default forwardRef(TokenItem)
