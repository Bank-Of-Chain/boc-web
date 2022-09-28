/* eslint-disable */
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
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
import find from 'lodash/find'
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

  const refArray = map(tokens, () => useRef(null))
  const [exchangePlatformAdapters, setExchangePlatformAdapters] = useState({})
  const [receiveToken, setReceiveToken] = useState(isEthi ? ETH_ADDRESS : USDT_ADDRESS)
  const [slippage, setSlippage] = useState('0.3')

  // input values
  const [values, setValues] = useState([])
  const [balances, setBalances] = useState([])
  const [decimals, setDecimals] = useState([])
  const [isSwapping, setIsSwapping] = useState(false)
  const [count, setCount] = useState(0)

  const swapInfoArray = map(refArray, item => get(item, 'current.swapInfo', {}))
  // TODO: some tokens is fetching swap path
  const isSwapInfoFetchingSome = some(refArray, item => {
    return get(item, 'current.isSwapInfoFetching')
  })
  // TODO: some tokens is staticCalling
  const isStaticCallingSome = some(refArray, item => {
    return get(item, 'current.isStaticCalling')
  })
  // some tokens approve enough but not done
  const someStaticCallError = () => {
    // TODO
    return false
  }
  // TODO: all tokens done
  const allDone = () => {
    console.groupCollapsed('allDone call')
    map(refArray, (item, index) => {
      console.log('item', item)
    })
    console.groupEnd('allDone call')
    return false
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
  // TODO: has some item fetch swap path failed
  const isSwapError = () => {
    return some(swapInfoArray, el => el instanceof Error)
  }
  // some error input value
  const someErrorValue = some(refArray, item => {
    const isErrorValue = get(item, 'current.isErrorValue')
    if (typeof isErrorValue !== 'function') {
      return false
    }
    return isErrorValue()
  })

  const receiveAmount = reduce(
    refArray,
    (rs, item) => {
      return rs.add(BigNumber.from(get(item, 'current.swapInfo.bestSwapInfo.toTokenAmount', '0')))
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
    return exchangeAdapters
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
  const receiveTokenAmount = find(tokens, el => el.address === receiveToken)?.amount || '0'

  const approveAll = async () => {
    console.groupCollapsed('approveAll call')
    setIsSwapping(true)
    try {
      for (let i = 0; i < tokens.length; i++) {
        console.log('tokens=', tokens, isReciveToken(i))
        if (isReciveToken(i)) continue
        await refArray[i].current.approve()
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
  const batchSwap = async () => {
    console.groupCollapsed('batchSwap call')
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
    console.groupEnd('batchSwap call')
  }

  // approve the current token with current value
  const approve = index => {
    return
  }

  const clickSwap = () => {
    console.groupCollapsed('clickSwap call')
    if (allDone()) {
      setIsSwapping(true)
      batchSwap()
    } else {
      approveAll()
    }
    console.groupEnd('clickSwap call')
  }

  const resetState = () => {}

  const changeSlippage = value => {
    onSlippageChange(value)
  }

  const onChildStateChange = () => {
    setCount(count + 1)
  }

  useEffect(() => {
    async function getAdapters() {
      console.groupCollapsed('getAdapters useEffect call')
      const exchangeManagerContract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
      const exchangeAdapters = await getExchangePlatformAdapters(exchangeManagerContract, userProvider)
      console.log('exchangeAdapters', exchangeAdapters)
      setExchangePlatformAdapters(exchangeAdapters)
      console.groupEnd('getAdapters useEffect call')
    }
    getAdapters()
  }, [exchangeManager])

  return (
    <div className={classes.main}>
      <div className={classes.title}>Swap to single token</div>
      <div className={classes.approveContainer}>
        <div>Swap tokens:</div>
        {map(tokens, (token, index) => {
          if (token.amount === '0' || isReciveToken(index)) return
          return (
            <TokenItem
              ref={refArray[index]}
              key={token.address}
              userAddress={userAddress}
              userProvider={userProvider}
              token={token}
              slippage={slippage}
              receiveToken={receiveToken}
              exchangeManager={exchangeManager}
              exchangePlatformAdapters={exchangePlatformAdapters}
              receiveTokenDecimals={receiveTokenDecimals}
              EXCHANGE_AGGREGATOR_ABI={EXCHANGE_AGGREGATOR_ABI}
              onChange={onChildStateChange}
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
              onChange={v => setReceiveToken(v)}
            />
          </GridItem>
          <GridItem xs={8} sm={8} md={8} className={classes.estimateBalance}>
            <Loading loading={isSwapInfoFetchingSome} className={classes.reloadIcon}>
              <div className={classes.textOverflow}>{toFixed(receiveAmount, receiveTokenDecimals, 6)} from token swap</div>
              {receiveTokenAmount !== '0' && <div>{`+${toFixed(receiveTokenAmount, receiveTokenDecimals, 6)}`} from withdrawal</div>}
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
            onMaxClick={() => setSlippage('45')}
            onChange={e => setSlippage(e.target.value)}
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
              someErrorValue
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

ApproveArrayV2.propTypes = {
  address: PropTypes.string.isRequired,
  exchangeManager: PropTypes.string.isRequired
}

export default ApproveArrayV2
