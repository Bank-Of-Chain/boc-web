/* eslint-disable */
import React, { useEffect, useState, useCallback, useRef } from 'react'
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
import TokenItem from '@/components/TokenItem'

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

const ApproveArrayV2 = props => {
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

  const refArray = map(tokens, () => useRef(null))
  console.groupCollapsed('init state')
  console.log('refArray=', refArray)
  console.groupEnd('init state')
  const initValues = map(tokens, () => undefined)
  const initBoolValues = map(tokens, () => false)
  const initNumberValues = map(tokens, () => 0)
  const initObjectValues = map(tokens, () => {
    return {}
  })

  const [exchangePlatformAdapters, setExchangePlatformAdapters] = useState({})
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
    const exchangeAdapters = {}
    for (const address of adapters) {
      const contract = new ethers.Contract(address, EXCHANGE_ADAPTER_ABI, userProvider)
      exchangeAdapters[await contract.identifier()] = address
    }
    setExchangePlatformAdapters(exchangeAdapters)
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

  // approve the current token with current value
  const approve = index => {
    return
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
    const exchangeManagerContract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
    getExchangePlatformAdapters(exchangeManagerContract, userProvider)
  }, [exchangeManager])

  return (
    <div className={classes.main}>
      <div className={classes.title}>Swap to single token</div>
      <div className={classes.approveContainer}>
        <div>Swap tokens:</div>
        {map(tokens, (token, index) => {
          return (
            <TokenItem
              // ref={refArray[index]}
              key={token.address}
              userAddress={userAddress}
              userProvider={userProvider}
              token={token}
              slippage={slippage}
              receiveToken={receiveToken}
              exchangeManager={exchangeManager}
              exchangePlatformAdapters={exchangePlatformAdapters}
              receiveTokenDecimals={receiveTokenDecimals}
            />
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

export default ApproveArrayV2
