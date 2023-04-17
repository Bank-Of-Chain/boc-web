import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import SimpleSelect from '@/components/SimpleSelect'
import Button from '@/components/CustomButtons/Button'
import CustomTextField from '@/components/CustomTextField'
import Loading from '@/components/LoadingComponent'
import CachedIcon from '@material-ui/icons/Cached'
import TokenItem from '@/components/TokenItem/TokenItemV2'
import SnackBarCard from '@/components/SnackBarCard'

// === Hooks === //
import { useSnackbar } from 'notistack'

// === Utils === //
import { useDispatch } from 'react-redux'
import * as ethers from 'ethers'
import get from 'lodash/get'
import map from 'lodash/map'
import some from 'lodash/some'
import size from 'lodash/size'
import first from 'lodash/first'
import every from 'lodash/every'
import reduce from 'lodash/reduce'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
import compact from 'lodash/compact'
import find from 'lodash/find'
import isNumber from 'lodash/isNumber'
import isUndefined from 'lodash/isUndefined'
import { toFixed } from '@/helpers/number-format'
import { warmDialog } from '@/reducers/meta-reducer'
import { errorTextOutput, isLossMuch } from '@/helpers/error-handler'

// === Constants === //
import { USDT_ADDRESS, USDC_ADDRESS, DAI_ADDRESS, MULTIPLE_OF_GAS, MAX_GAS_LIMIT } from '@/constants'
import { ETH_ADDRESS } from '@/constants/tokens'
import { BN_6, BN_18 } from '@/constants/big-number'
import { TRANSACTION_REPLACED, CALL_EXCEPTION } from '@/constants/metamask'
import { EXCHANGE_ADAPTER_ABI_V1_5_9 as EXCHANGE_ADAPTER_ABI, EXCHANGE_AGGREGATOR_ABI_v1_6_0 as EXCHANGE_AGGREGATOR_ABI } from '@/constants/abi'

// === Styles === //
import styles from './style-v3'

const { Contract, BigNumber } = ethers
const useStyles = makeStyles(styles)
const MAX_RETRY_TIME = 2

const ApproveArrayV3 = props => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { isEthi, userProvider, tokens, address: userAddress, exchangeManager, handleClose } = props

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const refArray = useMemo(() => map(tokens, () => React.createRef(null)), [tokens])
  const [exchangePlatformAdapters, setExchangePlatformAdapters] = useState({})
  const [receiveToken, setReceiveToken] = useState(isEthi ? ETH_ADDRESS : USDT_ADDRESS)
  const [slippage, setSlippage] = useState('0.5')
  const [isSwapping, setIsSwapping] = useState(false)
  const [, setCount] = useState(0)
  const [callStateArray, setCallStateArray] = useState(map(tokens, () => undefined))

  const swapInfoArray = map(refArray, item => get(item, 'current.swapInfo', {}))
  // some tokens is fetching swap path
  const someFetching = some(refArray, item => {
    return get(item, 'current.isFetching')
  })
  // some tokens approve enough but not done
  const someSwapError = () => {
    return some(refArray, item => {
      if (!item.current?.retryTimes) {
        return false
      }
      return item.current.retryTimes > MAX_RETRY_TIME
    })
  }
  // all tokens done
  const allDone = () => {
    return every(refArray, (item, index) => {
      if (isReciveToken(index) || item.current.isEmptyValue()) {
        return true
      }
      return get(item, 'current.done', true)
    })
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
      if (!item.current?.swapInfo?.bestSwapInfo?.toTokenAmount) {
        return rs
      }
      return rs.add(BigNumber.from(item.current.swapInfo.bestSwapInfo.toTokenAmount))
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

  /**
   *
   */
  const snackbarCall = useCallback(
    obj => {
      const { tx, tokenAddress, amount, decimals } = obj
      const { hash } = tx
      enqueueSnackbar(
        <SnackBarCard
          tx={tx}
          text={
            <span>
              approve
              <span className="mx-2 color-lightblue-500 cursor-pointer">{toFixed(amount, BigNumber.from(10).pow(decimals), isEthi ? 4 : 2)}</span>
              <img className="w-4 h-4 b-rd-2 v-text-bottom" src={`/images/${tokenAddress}.png`} alt={tokenAddress} />
            </span>
          }
          hash={hash}
          close={() => closeSnackbar(hash)}
        />,
        { persist: true, key: hash }
      )
    },
    [enqueueSnackbar, closeSnackbar]
  )

  const approveAll = async () => {
    // console.groupCollapsed('approveAll call')
    try {
      for (let i = 0; i < tokens.length; i++) {
        // console.log(`tokens[${i}] isReciveToken=`, isReciveToken(i))
        if (isReciveToken(i)) continue
        const enough = refArray[i].current.isApproveEnough()
        // console.log(`refArray[${i}] isApproveEnough=`, enough)
        if (enough) continue
        await refArray[i].current.approve(snackbarCall)
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
      // console.groupEnd('approveAll call')
      return
    }
    const someApproveNotEnough = some(refArray, item => {
      if (!item.current) {
        return false
      }
      return !item.current.isApproveEnough()
    })
    if (someApproveNotEnough) {
      setIsSwapping(false)
      dispatch(
        warmDialog({
          open: true,
          type: 'error',
          message: 'Allowance not enough'
        })
      )
      return
    }
    // console.groupEnd('approveAll call')
  }

  // All done, swap
  const batchSwap = debounce(async () => {
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
      const { hash } = tx
      enqueueSnackbar(
        <SnackBarCard
          tx={tx}
          text={
            <span>
              swap into
              <img className="w-4 h-4 b-rd-2 v-text-bottom ml-2" src={`/images/${receiveToken}.png`} alt={receiveToken} />
            </span>
          }
          hash={hash}
          close={() => closeSnackbar(hash)}
        >
          <div className="flex flex-wrap mb-2">
            {map(tokens, (item, index) => {
              const value = refArray[index].current.value
              return (
                <div className="flex items-center mr-2">
                  <img className="w-4 h-4 b-rd-2" src={`/images/${item.address}.png`} alt={item.address} />
                  <span className="ml-1">{value}</span>
                </div>
              )
            })}
          </div>
        </SnackBarCard>,
        { persist: true, key: hash }
      )
      const isSuccess = await tx.wait().catch(error => {
        console.log('TRANSACTION_REPLACED=', error, Object.keys(error))
        const { code, replacement, cancelled, reason, receipt } = error
        console.log('code=', code)
        console.log('replacement=', replacement)
        console.log('cancelled=', cancelled)
        console.log('reason=', reason)
        console.log('receipt=', receipt)
        // if error due to 'TRANSACTION_REPLACED'
        // we should wait the replacement transaction commit before we close the modal
        if (code === TRANSACTION_REPLACED) {
          // if user add gas for tx canceled, return undefined
          if (cancelled) {
            return
          }
          const replaceTransaction = replacement
          return replaceTransaction.wait()
        } else if (code === CALL_EXCEPTION) {
          dispatch(
            warmDialog({
              open: true,
              type: 'error',
              message: reason
            })
          )
          setIsSwapping(false)
          return false
        }
      })

      if (isUndefined(isSuccess)) {
        dispatch(
          warmDialog({
            open: true,
            type: 'warning',
            message: 'Cancelled!'
          })
        )
        setIsSwapping(false)
        return
      }

      if (isSuccess) {
        dispatch(
          warmDialog({
            open: true,
            type: 'success',
            message: 'Swap Success!'
          })
        )
        handleClose()
      }
    } catch (error) {
      console.log('batchSwap error:', error)
      const errorMsg = errorTextOutput(error)
      let message = 'Swap Failed, please retry.'
      if (isLossMuch(errorMsg)) {
        message = 'Swap Failed, please increase the slippage and retry.'
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
  }, 500)

  const clickSwap = () => {
    // console.groupCollapsed('clickSwap call')
    setIsSwapping(true)
    if (allDone()) {
      batchSwap()
    } else {
      approveAll()
    }
    // console.groupEnd('clickSwap call')
  }

  // when child state change, reRender component
  const onChildStateChange = useCallback(() => {
    setCount(Math.random())
  }, [])

  const onStaticCallFinish = useCallback(
    (index, bool, error) => {
      console.groupCollapsed(`onStaticCallFinish call ${index} ${bool}`)
      const nextArray = map(callStateArray, (item, i) => {
        if (isReciveToken(i) || refArray[i].current.isEmptyValue()) {
          return true
        }
        if (i === index) {
          return bool
        }
        return item
      })
      setCallStateArray(nextArray)
      console.log('nextArray', nextArray)
      if (!isSwapping) {
        console.log('isSwapping', isSwapping)
        console.groupEnd(`onStaticCallFinish call ${index} ${bool}`)
        return
      }
      const allFinish = every(nextArray, item => item !== undefined)
      if (!allFinish) {
        console.log('allFinish', allFinish)
        console.groupEnd(`onStaticCallFinish call ${index} ${bool}`)
        return
      }
      const someError = some(nextArray, item => item === false)
      if (someError) {
        console.log('someError', someError)
        setIsSwapping(false)
        let message = 'Swap Failed, please retry.'
        if (error) {
          const errorMsg = errorTextOutput(error)
          if (isLossMuch(errorMsg)) {
            message = 'Swap Failed, please increase the slippage and retry.'
          }
        }
        dispatch(
          warmDialog({
            open: true,
            type: 'error',
            message
          })
        )
        console.groupEnd(`onStaticCallFinish call ${index} ${bool}`)
        return
      }
      console.groupEnd(`onStaticCallFinish call ${index} ${bool}`)
      batchSwap()
    },
    [callStateArray, isSwapping]
  )

  const onReceiveChange = v => {
    if (someFetching) {
      return
    }
    setReceiveToken(v)
  }

  useEffect(() => {
    async function getAdapters() {
      // console.groupCollapsed(`getAdapters useEffect call:${++sycIndex}`)
      const exchangeManagerContract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
      const exchangeAdapters = await getExchangePlatformAdapters(exchangeManagerContract, userProvider)
      // console.log('exchangeAdapters', exchangeAdapters)
      setExchangePlatformAdapters(exchangeAdapters)
      // console.groupEnd(`getAdapters useEffect call:${sycIndex}`)
    }
    getAdapters()
  }, [exchangeManager])

  return (
    <div className={classes.main}>
      <div className={classes.approveContainer}>
        <div className={classes.title}>Swap tokens:</div>
        {map(tokens, (token, index) => {
          const style = {}
          if (token.amount === '0' || (tokens.length > 1 && isReciveToken(index))) {
            style.display = 'none'
          }
          return (
            <TokenItem
              style={style}
              ref={refArray[index]}
              key={`${token.address}-${receiveToken}`}
              userAddress={userAddress}
              userProvider={userProvider}
              token={token}
              slippage={slippage}
              receiveToken={receiveToken}
              exchangeManager={exchangeManager}
              exchangePlatformAdapters={exchangePlatformAdapters}
              receiveTokenDecimals={receiveTokenDecimals}
              EXCHANGE_AGGREGATOR_ABI={EXCHANGE_AGGREGATOR_ABI}
              disabled={isSwapping}
              onChange={onChildStateChange}
              onStaticCallFinish={(bool, error) => {
                onStaticCallFinish(index, bool, error)
              }}
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
              disabled={selectOptions.length <= 1 || isSwapping || someFetching}
              value={receiveToken}
              onChange={v => onReceiveChange(v)}
            />
          </GridItem>
          <GridItem xs={8} sm={8} md={8} className={classes.estimateBalance}>
            <Loading loading={someFetching} className={classes.reloadIcon}>
              <div className={classes.textOverflow}>{toFixed(receiveAmount, receiveTokenDecimals, 6)} from token swap</div>
              {receiveTokenAmount !== '0' && <div>{`+${toFixed(receiveTokenAmount, receiveTokenDecimals, 6)}`} from withdrawal</div>}
            </Loading>
          </GridItem>
        </GridContainer>
      </div>
      <GridContainer className={classes.slippage}>
        <GridItem xs={4} sm={4} md={4} className={classes.slippageTitlte}>
          Slippage tolerance(%):
        </GridItem>
        <GridItem xs={8} sm={8} md={8}>
          <CustomTextField
            value={slippage}
            placeholder="Allow slippage percent"
            maxEndAdornment
            disabled={isSwapping || someFetching}
            onMaxClick={() => setSlippage('45')}
            onChange={e => setSlippage(e.target.value)}
            error={!isValidSlippage()}
          />
        </GridItem>
      </GridContainer>
      <GridContainer className="mt-4">
        <GridItem xs={4} sm={4} md={4} className="pr-4">
          <Button color="danger" fullWidth={true} onClick={handleClose} className={classes.cancelButton}>
            Cancel
          </Button>
        </GridItem>
        <GridItem xs={8} sm={8} md={8}>
          <Button
            color="colorful"
            fullWidth={true}
            onClick={clickSwap}
            disabled={noNeedSwap || someFetching || isSwapping || someSwapError() || !isValidSlippage() || receiveAmount.lte(0) || someErrorValue}
            className={classes.okButton}
            startIcon={isSwapping ? <CachedIcon className={classes.loading} /> : null}
          >
            Zap
          </Button>
        </GridItem>
      </GridContainer>
    </div>
  )
}

ApproveArrayV3.propTypes = {
  address: PropTypes.string.isRequired,
  exchangeManager: PropTypes.string.isRequired
}

export default ApproveArrayV3
