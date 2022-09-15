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
import isUndefined from 'lodash/isUndefined'
import { toFixed } from '@/helpers/number-format'
import { getBestSwapInfo } from 'piggy-finance-utils'
import BN from 'bignumber.js'
import { addToken } from '@/helpers/wallet'
import { warmDialog } from '@/reducers/meta-reducer'
import { getProtocolsFromBestRouter } from '@/helpers/swap-util'
import { errorTextOutput, isTransferNotEnough, isLossMuch } from '@/helpers/error-handler'

// === Constants === //
import { IERC20_ABI, EXCHANGE_EXTRA_PARAMS, ORACLE_ADDITIONAL_SLIPPAGE, USDT_ADDRESS, USDC_ADDRESS, DAI_ADDRESS } from '@/constants'
import { ETH_ADDRESS, WETH_ADDRESS } from '@/constants/tokens'
import { BN_6, BN_18 } from '@/constants/big-number'

// === Styles === //
import styles from './style'
import { compact } from 'lodash'

const { Contract, BigNumber } = ethers
const useStyles = makeStyles(styles)

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

  const initValues = tokens.map(() => undefined)
  const initBoolValues = tokens.map(() => false)
  const initObjectValues = tokens.map(() => {
    return {}
  })
  const [receiveToken, setReceiveToken] = useState(isEthi ? ETH_ADDRESS : USDT_ADDRESS)
  const [values, setValues] = useState([])
  const [balances, setBalances] = useState([])
  const [decimals, setDecimals] = useState([])
  const [allowances, setAllowances] = useState([])
  // record if in approve status
  const [loadingArray, setLoadingArray] = useState(initBoolValues)
  const [isSwapping, setIsSwapping] = useState(false)

  // encludeArray for 1inch/paraswap
  const [encludeArray, setEncludeArray] = useState(initObjectValues)

  // 是否在加载账户的allowance等信息
  const [isReload, setIsReload] = useState(false)
  // 存放兑换路径
  const [swapInfoArray, setSwapInfoArray] = useState(initValues)
  // 是否在获取兑换路径
  const [isSwapInfoFetching, setIsSwapInfoFetching] = useState(initBoolValues)
  // 是否在进行staticCall
  const [isStaticCalling, setIsStaticCalling] = useState(initBoolValues)
  // 是否已经完成兑换路径获取和staticCall
  const [doneArray, setDoneArray] = useState(initBoolValues)

  // 有部分币在获取兑换路径
  const isSwapInfoFetchingSome = some(isSwapInfoFetching)
  // 有部分币在staticCall
  const isStaticCallingSome = some(isStaticCalling)

  const receiveAmount = reduce(
    swapInfoArray,
    (rs, item) => {
      return rs.add(BigNumber.from(get(item, 'bestSwapInfo.toTokenAmount', '0')))
    },
    BigNumber.from(0)
  )
  console.log('--------------------------------------------------')
  console.log('swapArray=', swapInfoArray, 'doneArray=', doneArray)
  console.log('isSwapInfoFetching=', isSwapInfoFetching, 'isStaticCalling=', isStaticCalling)
  console.log('EncludeArray=', encludeArray)
  console.log(
    'allowances=',
    map(allowances, i => i.toString())
  )
  console.log(
    'values=',
    map(values, i => i.toString())
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
  const receiveTokenAmount = values[tokens.findIndex(el => el.address === receiveToken)] || '0'

  const reload = useCallback(async () => {
    const loadingArr = loadingArray.map(() => false)
    setLoadingArray(loadingArr)
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
            balance: (await userProvider.getBalance(userAddress).catch(() => BigNumber.from('0'))).toString()
          }
        }
        const contract = new Contract(address, IERC20_ABI, userProvider)
        const allowance = (await contract.allowance(userAddress, exchangeManager).catch(() => BigNumber.from('0'))).toString()
        const balance = (await contract.balanceOf(userAddress).catch(() => BigNumber.from('0'))).toString()
        const decimal = await contract.decimals().catch(() => BigNumber.from('0'))
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
    const nextValue = map(tokens, (v, i) => {
      if (i === index) return val
      return values[i]
    })

    const nextSwapInfoArray = map(swapInfoArray, (item, i) => {
      if (i === index) return undefined
      return item
    })

    const nextDoneArray = map(doneArray, (item, i) => {
      if (i === index) return false
      return item
    })
    const nextIsSwapInfoFetching = map(isSwapInfoFetching, (item, i) => {
      if (i === index) return true
      return item
    })

    setValues(nextValue)
    setDoneArray(nextDoneArray)
    setSwapInfoArray(nextSwapInfoArray)
    setIsStaticCalling(initBoolValues)
    setIsSwapInfoFetching(nextIsSwapInfoFetching)
  }

  const approveValue = useCallback(
    async index => {
      const token = get(tokens, index)
      const value = get(values, index)
      const decimal = get(decimals, index)
      // ETH no need approve
      if (isEmpty(token) || isNil(value) || value === '0') return
      const loadingArr = loadingArray.map((item, i) => i === index)
      setLoadingArray(loadingArr)
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
        // If allowance equal 0, approve nextAmount, otherwise approve 0 and approve nextAmount
        if (allowanceAmount.gt(0)) {
          console.log('add allowance:', nextValue.sub(allowanceAmount).toString())
          if (address === WETH_ADDRESS) {
            return contractWithUser
              .approve(exchangeManager, 0)
              .then(tx => tx.wait())
              .then(() => contractWithUser.approve(exchangeManager, nextValue).then(tx => tx.wait()))
          }
          return await contractWithUser
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
                .then(() => contractWithUser.approve(exchangeManager, nextValue).then(tx => tx.wait()))
            })
        } else {
          console.log('current allowance:', allowanceAmount.toString(), 'next allowance:', nextValue.toString())
          return await contractWithUser
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
    },
    [tokens, values, decimals, userAddress, exchangeManager]
  )

  // check the approve amount is enough
  const isApproveNotEnough = useCallback(
    index => {
      const token = tokens[index]
      const allowance = allowances[index]
      const decimal = decimals[index]
      const value = values[index]
      if (isEmpty(allowance) || isEmpty(decimal) || isEmpty(value) || token.address === ETH_ADDRESS || isReciveToken(index)) return false
      try {
        const nextValue = new BN(value).multipliedBy(decimal.toString())
        console.log('nextValue=', nextValue.toString(), allowance.toString(), nextValue.gt(allowance))
        return nextValue.gt(allowance)
      } catch (error) {
        return false
      }
    },
    [tokens, allowances, decimals, values, receiveToken]
  )

  const swap = useCallback(async () => {
    if (isEmpty(swapInfoArray)) return

    for (let i = 0; i < tokens.length; i++) {
      if (isReciveToken(i)) continue
      await approve(i)
    }

    const someApproveNotEnough = some(tokens, (token, index) => {
      console.log('isApproveNotEnough(index)=', index, isApproveNotEnough(index))
      return isApproveNotEnough(index)
    })
    console.log('someApproveNotEnoughsomeApproveNotEnoughsomeApproveNotEnoughsomeApproveNotEnough=', someApproveNotEnough)
    if (someApproveNotEnough) {
      dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Please approve the amount of coins to be exchanged in full!'
        })
      )
      return
    }
    setIsSwapping(true)
    const nextSwapArray = compact(
      map(swapInfoArray, i => {
        if (isEmpty(i) || i instanceof Error) return
        const { bestSwapInfo, info } = i
        return {
          platform: bestSwapInfo.platform,
          method: bestSwapInfo.method,
          data: bestSwapInfo.encodeExchangeArgs,
          swapDescription: info
        }
      })
    )
    const constract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
    const signer = userProvider.getSigner()
    constract
      .connect(signer)
      .batchSwap(nextSwapArray)
      .then(tx => tx.wait())
      .then(handleClose)
      .then(() => {
        dispatch(
          warmDialog({
            open: true,
            type: 'success',
            message: 'Swap Success!'
          })
        )
      })
      .catch(error => {
        const errorMsg = errorTextOutput(error)
        let tip = ''
        if (isTransferNotEnough(errorMsg)) {
          tip = 'Transfer Not Enough'
        } else if (isLossMuch(errorMsg)) {
          tip = 'Swap Failed, please increase the exchange slippage'
        } else {
          tip = errorMsg
        }
        dispatch(
          warmDialog({
            open: true,
            type: 'error',
            message: tip
          })
        )
      })
      .finally(() => {
        setIsSwapping(false)
      })
  }, [isApproveNotEnough])

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
      console.groupCollapsed('查询最佳兑换路径' + fromToken.address + '-' + toToken.address + '-' + index)
      let nextExchangeExtraParams = assign({}, EXCHANGE_EXTRA_PARAMS, isEmpty(exchangePlatformAdapters.testAdapter) ? {} : {})

      if (!isEmpty(encludeArray[index])) {
        const { oneInchV4, paraswap } = encludeArray[index]
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
      ).catch(() => {
        return {}
      })
      // const bestSwapInfo = {}
      console.groupEnd('查询最佳兑换路径' + fromToken.address + '-' + toToken.address + '-' + index)
      if (isEmpty(bestSwapInfo)) return new Error('bestSwapInfo fetch error')
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
    [values, encludeArray, receiveToken]
  )

  const estimateWithValue = useCallback(
    debounce(async refreshIndex => {
      if (isEmpty(receiveToken)) return

      const exchangeManagerContract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
      const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract, userProvider)

      const nextIsSwapInfoFetching = map(swapInfoArray, (swapInfoArrayItem, index) => {
        if (isReciveToken(index)) return false
        if (!isNil(refreshIndex)) {
          return refreshIndex === index
        } else {
          if (isEmpty(swapInfoArrayItem) || swapInfoArrayItem instanceof Error) {
            return true
          }
          return false
        }
      })
      setIsSwapInfoFetching(nextIsSwapInfoFetching)
      const requestArray = map(nextIsSwapInfoFetching, (nextIsSwapInfoFetchingItem, index) => {
        if (!nextIsSwapInfoFetchingItem) return swapInfoArray[index]
        return queryBestSwapInfo(tokens[index], values[index] || '0', decimals[index], index, exchangePlatformAdapters)
      })
      Promise.all(requestArray)
        .then(setSwapInfoArray)
        .finally(() => {
          setTimeout(() => {
            setIsSwapInfoFetching(initBoolValues)
          }, 1000)
        })
    }, 1500),
    [receiveToken, exchangeManager, tokens, values, decimals, swapInfoArray]
  )

  // check the receive token is current index?
  const isReciveToken = useCallback(
    index => {
      return tokens[index]?.address === receiveToken
    },
    [tokens, receiveToken]
  )

  // check the slippage is valid or not
  const isValidSlippage = () => {
    if (slippage === '' || isEmpty(slippage.replace(/ /g, ''))) return
    if (isNaN(slippage)) return false
    if (slippage < 0.01 || slippage > 45) return false
    return true
  }

  const reloadSwap = index => {
    const nextSwapInfoArray = map(swapInfoArray, (item, i) => {
      if (i === index) return undefined
      return item
    })

    const nextIsSwapInfoFetching = map(isSwapInfoFetching, (item, i) => {
      if (i === index) return true
      return false
    })

    setSwapInfoArray(nextSwapInfoArray)
    setIsSwapInfoFetching(nextIsSwapInfoFetching)
    estimateWithValue(index)
  }

  // has some item fetch swap path failed
  const isSwapError = () => {
    return some(swapInfoArray, el => el instanceof Error)
  }

  // approve the current token with current value
  const approve = index =>
    approveValue(index)
      .then(reload)
      .finally(() => {
        const loadingArr = loadingArray.map(() => false)
        setLoadingArray(loadingArr)
      })

  useEffect(() => {
    if (isEmpty(userAddress)) return
    reload()
    const timer = setInterval(reload, 10000)
    return () => clearInterval(timer)
  }, [tokens, userAddress, exchangeManager])

  useEffect(() => {
    if (isReload) return
    if (isEmpty(receiveToken)) return
    const someTokenHasValidValue = some(values, (allo, index) => {
      if (isReciveToken(index)) return false
      return !isEmpty(allo) && allo !== '0'
    })
    if (!someTokenHasValidValue) return
    estimateWithValue()
    return () => estimateWithValue.cancel()
  }, [isReciveToken, isReload, values, receiveToken, slippage])

  useEffect(() => {
    if (isEmpty(swapInfoArray) || isEmpty(exchangeManager)) return
    if (every(doneArray, i => i === true)) return

    const constract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
    const signer = userProvider.getSigner()
    const constractWithSigner = constract.connect(signer)

    const nextSwapInfoArray = map(swapInfoArray, (swapInfoArrayItem, index) => {
      const doneArrayItem = doneArray[index]
      if (doneArrayItem || isEmpty(swapInfoArrayItem) || swapInfoArrayItem instanceof Error || isApproveNotEnough(index)) return
      const { bestSwapInfo, info } = swapInfoArrayItem
      return {
        platform: bestSwapInfo.platform,
        method: bestSwapInfo.method,
        data: bestSwapInfo.encodeExchangeArgs,
        swapDescription: info
      }
    })
    const nextIsStaticCalling = map(nextSwapInfoArray, i => !isEmpty(i))
    console.log('abc nextIsStaticCalling=', nextIsStaticCalling)
    setIsStaticCalling(nextIsStaticCalling)

    const staticCallArray = map(nextSwapInfoArray, swapInfoArrayItem => {
      if (isEmpty(swapInfoArrayItem)) return false
      const { platform, method, data, swapDescription } = swapInfoArrayItem
      return constractWithSigner.callStatic
        .swap(platform, method, data, swapDescription)
        .then(() => true)
        .catch(() => false)
    })

    Promise.allSettled(staticCallArray).then(result => {
      const nextDoneArray = map(doneArray, (doneArrayItem, index) => {
        if (doneArrayItem === true) return true
        return result[index]?.value
      })
      console.log('abc nextDoneArray=', nextDoneArray, 'encludeArray=', encludeArray)
      const nextEncludeArray = map(encludeArray, (encludeArrayItem, index) => {
        const doneArrayItem = doneArray[index]
        const resultItem = result[index] || {}
        if (doneArrayItem === true) return encludeArrayItem
        if (resultItem.status === 'rejected') {
          const { bestSwapInfo } = swapInfoArray[index]
          const array = getProtocolsFromBestRouter(bestSwapInfo)
          const { name } = bestSwapInfo
          const nextItem = {
            ...encludeArrayItem,
            [name]: array.concat(encludeArrayItem[name])
          }
          return nextItem
        }
        return encludeArrayItem
      })
      console.log('abc nextEncludeArray=', nextEncludeArray)
      setDoneArray(nextDoneArray)
      setIsStaticCalling(initBoolValues)
      setEncludeArray(nextEncludeArray)
    })

    // constractWithSigner.callStatic.batchSwap(compact(nextSwapInfoArray)).catch(error => {
    //   const errorMsg = errorTextOutput(error)
    //   let tip = ''
    //   if (isTransferNotEnough(errorMsg)) {
    //     tip = 'Transfer Not Enough'
    //   } else if (isLossMuch(errorMsg)) {
    //     tip = 'Swap Failed, please increase the exchange slippage'
    //   } else {
    //     tip = errorMsg
    //   }
    //   dispatch(
    //     warmDialog({
    //       open: true,
    //       type: 'error',
    //       message: tip
    //     })
    //   )
    // })
  }, [exchangeManager, userAddress, swapInfoArray, values])

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
                const isSwapping = !isReciveToken(index) && (isSwapInfoFetching[index] || isStaticCalling[index])
                const isSwapSuccess =
                  !isSwapping && !isReciveToken(index) && ((!isApproveNotEnough(index) && doneArrayItem) || !isEmpty(swapInfoArrayItem))
                const isSwapError = !isSwapping && !isReciveToken(index) && swapInfoArrayItem instanceof Error
                // const staticCallError = get(staticCallResp, `${index}.status`, '') === 'rejected'
                // value should be a integer
                const nextFromValueString = new BN(value).multipliedBy(decimal.toString())
                const isErrorValue =
                  !isEmpty(value) && (new BN(value).multipliedBy(decimal.toString()).gt(balance) || nextFromValueString.toFixed().indexOf('.') !== -1)
                // const isEthAddress = address === ETH_ADDRESS
                // const isOverFlow = new BN(value).multipliedBy(decimal.toString()).lte(allowance.toString())
                // const loading = loadingArray[index]
                return (
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    key={index}
                    className={classNames({
                      [classes.isSwappingContainer]: isSwapping,
                      [classes.successContainer]: isSwapSuccess,
                      [classes.errorContainer]: isSwapError,
                      [classes.reciveContainer]: isReciveToken(index)
                    })}
                  >
                    <div className={classNames(classes.approveItemWrapper)}>
                      <div className={classes.approveItem}>
                        <CustomTextField
                          classes={{ root: classes.input }}
                          value={value}
                          onChange={event => handleInputChange(event.target.value, index)}
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
                          disabled={isReciveToken(index)}
                          onMaxClick={() => {
                            if (isReciveToken(index)) return
                            handleInputChange(toFixed(balance, decimal), index)
                          }}
                          error={isErrorValue}
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
                      {!isReciveToken(index) && isSwapping && (
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
              value={receiveToken}
              onChange={v => {
                setSwapInfoArray(initValues)
                setDoneArray(initBoolValues)
                setReceiveToken(v)
              }}
              options={selectOptions}
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
              onMaxClick={() => onSlippageChange('45')}
              onChange={event => {
                const { value } = event.target
                onSlippageChange(value)
              }}
              // error={(!isUndefined(isValidSlippage()) && !isValidSlippage()) || (!isStaticCallLoading && isStaticCallError)}
              error={!isUndefined(isValidSlippage()) && !isValidSlippage()}
            />
          </span>
        </h3>
        <div className={classes.buttonGroup}>
          <Button
            color="colorfull"
            onClick={swap}
            disabled={noNeedSwap || isSwapInfoFetchingSome || isStaticCallingSome || isSwapError()}
            // disabled={(!isStaticCallLoading && isStaticCallError) || noNeedSwap || isSwapInfoFetchingSome || isSwapError() || isSwapping}
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
