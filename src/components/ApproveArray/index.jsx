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
import CheckIcon from '@material-ui/icons/Check'
import AddIcon from '@material-ui/icons/Add'
import ReplayIcon from '@material-ui/icons/Replay'
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'

// === Utils === //
import { useDispatch } from 'react-redux'
import * as ethers from 'ethers'
import get from 'lodash/get'
import map from 'lodash/map'
import some from 'lodash/some'
import size from 'lodash/size'
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
    slipper,
    EXCHANGE_ADAPTER_ABI,
    handleClose,
    onSlippageChange
  } = props

  const [receiveToken, setReceiveToken] = useState(isEthi ? ETH_ADDRESS : USDT_ADDRESS)
  const [receiveAmount, setReceiveAmount] = useState(BigNumber.from(0))
  const [isEstimate, setIsEstimate] = useState(false)
  const [values, setValues] = useState([])
  const [balances, setBalances] = useState([])
  const [decimals, setDecimals] = useState([])
  const [allowances, setAllowances] = useState([])
  const [swapArray, setSwapArray] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStaticCallError, setIsStaticCallError] = useState(false)
  const [isStaticCallLoading, setIsStaticCallLoading] = useState(false)

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
  const receiveTokenAmount = tokens.find(el => el.address === receiveToken)?.amount || '0'

  async function reload(tokens = [], userAddress, exchangeManager) {
    if (isEmpty(tokens) || isEmpty(exchangeManager) || isEmpty(userAddress)) {
      return
    }
    setIsLoading(true)
    const array = await Promise.all(
      map(tokens, async token => {
        const { address, amount } = token
        if (address === ETH_ADDRESS) {
          return {
            address,
            amount,
            decimal: 18,
            allowance: '0',
            balance: (await userProvider.getBalance(userAddress)).toString()
          }
        }
        const contract = new Contract(address, IERC20_ABI, userProvider)
        const allowance = (await contract.allowance(userAddress, exchangeManager)).toString()
        const balance = (await contract.balanceOf(userAddress)).toString()
        const decimal = await contract.decimals()
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
    setIsLoading(false)
    return reload
  }

  const handleInputChange = (val, index) => {
    const nextValue = map(tokens, (v, i) => {
      if (i === index) return val
      return values[i]
    })
    setValues(nextValue)
  }

  const approveValue = async index => {
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
      // If allowance equal 0, approve nextAmount, otherwise approve 0 and approve nextAmount
      if (allowanceAmount.gt(0)) {
        console.log('add allowance:', nextValue.sub(allowanceAmount).toString())
        if (address === WETH_ADDRESS) {
          return contractWithUser
            .approve(exchangeManager, 0)
            .then(tx => tx.wait())
            .then(() => contractWithUser.approve(exchangeManager, nextValue).then(tx => tx.wait()))
        }
        await contractWithUser
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
        await contractWithUser
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

  const swap = () => {
    if (isEmpty(swapArray)) return

    const nextSwapArray = compact(
      map(swapArray, i => {
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
  }

  const estimateWithValue = useCallback(
    debounce(async (values = [], decimals = [], receiveToken) => {
      if (isEmpty(receiveToken)) return
      setIsEstimate(true)
      setIsStaticCallError(false)
      const exchangeManagerContract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
      const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract, userProvider)
      const requestArray = map(tokens, async (token, index) => {
        const value = values[index] || '0'
        const decimal = decimals[index]
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
        const bestSwapInfo = await getBestSwapInfo(
          fromToken,
          toToken,
          swapAmount,
          parseInt(100 * parseFloat(slipper)) || 0,
          ORACLE_ADDITIONAL_SLIPPAGE,
          exchangePlatformAdapters,
          assign(EXCHANGE_EXTRA_PARAMS, isEmpty(exchangePlatformAdapters.testAdapter) ? {} : { testAdapter: {} })
        ).catch(() => {
          return {}
        })
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
      })
      Promise.all(requestArray)
        .then(bestSwapInfoArray => {
          const nextReceiveAmount = reduce(
            bestSwapInfoArray,
            (rs, item) => {
              return rs.add(BigNumber.from(get(item, 'bestSwapInfo.toTokenAmount', '0')))
            },
            BigNumber.from(0)
          )
          setSwapArray(bestSwapInfoArray)
          setReceiveAmount(nextReceiveAmount)
        })
        .finally(() => {
          setIsEstimate(false)
        })
    }, 1500)
  )

  useEffect(() => {
    if (isEmpty(userAddress)) return
    const timer = setInterval(reload(tokens, userAddress, exchangeManager), 1000000)
    return () => clearInterval(timer)
  }, [tokens, userAddress, exchangeManager])

  useEffect(() => {
    if (
      isLoading &&
      isEmpty(receiveToken) &&
      every(values, (allo, i) => {
        if (tokens[i].address === receiveToken) return true
        return isNil(allo) || allo === '0'
      })
    ) {
      return
    }
    estimateWithValue(values, decimals, receiveToken)
    return () => estimateWithValue.cancel()
  }, [isLoading, values, decimals, receiveToken, slipper])

  const someNotApprove = some(tokens, (token, index) => {
    const allowance = allowances[index]
    const decimal = decimals[index]
    const value = values[index]
    const balance = balances[index]
    if (isEmpty(allowance) || isEmpty(decimal) || isEmpty(value) || token.address === ETH_ADDRESS || token.address === receiveToken) return false
    try {
      const nextValue = new BN(value).multipliedBy(decimal.toString())
      return nextValue.gt(allowance) || nextValue.gt(balance)
    } catch (error) {
      return false
    }
  })

  const isValidSlipper = () => {
    if (slipper === '' || isEmpty(slipper.replace(/ /g, ''))) return
    if (isNaN(slipper)) return false
    if (slipper < 0.01 || slipper > 45) return false
    return true
  }

  const reloadSwap = () => {
    setSwapArray([])
    estimateWithValue(values, decimals, receiveToken)
  }

  const isSwapError = () => {
    return swapArray.some(el => el instanceof Error)
  }

  useEffect(() => {
    if (isEmpty(swapArray) || someNotApprove) return

    setIsStaticCallLoading(true)
    setIsStaticCallError(false)
    const nextSwapArray = compact(
      map(swapArray, i => {
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
      .callStatic.batchSwap(nextSwapArray)
      .catch(error => {
        setIsStaticCallError(true)
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
        setIsStaticCallLoading(false)
      })
  }, [swapArray, someNotApprove])

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
                const isReciveToken = address === receiveToken
                if (amount === '0') return
                const value = values[index] || ''
                const balance = balances[index] || '0'
                const decimal = decimals[index] || BigNumber.from(0)
                const allowance = allowances[index] || BigNumber.from(0)
                const swapError = swapArray[index] instanceof Error
                // value should be a integer
                const nextFromValueString = new BN(value).multipliedBy(decimal.toString())
                const isErrorValue =
                  !isEmpty(value) && (new BN(value).multipliedBy(decimal.toString()).gt(balance) || nextFromValueString.toFixed().indexOf('.') !== -1)
                const isEthAddress = address === ETH_ADDRESS
                const isOverFlow = new BN(value).multipliedBy(decimal.toString()).lte(allowance.toString())
                return (
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    key={address}
                    className={classNames({ [classes.errorContainer]: swapError, [classes.reciveContainer]: isReciveToken })}
                  >
                    <div className={classes.approveItemWrapper}>
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
                          disabled={isReciveToken}
                          onMaxClick={() => {
                            if (isReciveToken) return
                            handleInputChange(toFixed(balance, decimal), index)
                          }}
                          error={isErrorValue}
                        />
                        {isEthAddress || isReciveToken || (
                          <Button
                            className={classes.approveButton}
                            color="colorfull"
                            onClick={() => approveValue(index).then(() => reload(tokens, userAddress, exchangeManager))}
                          >
                            {isOverFlow ? (
                              <CheckIcon style={{ marginRight: '0.5rem', color: 'greenyellow' }} />
                            ) : (
                              <CompareArrowsIcon style={{ marginRight: '0.5rem' }} />
                            )}
                            approve
                          </Button>
                        )}
                      </div>
                      {!isReciveToken && (
                        <p className={classes.balanceText}>
                          balance:{' '}
                          <Loading loading={isLoading}>
                            <span title={toFixed(balances[index], decimal)}>{toFixed(balances[index], decimal, 6)}</span>
                          </Loading>
                          <span style={{ float: 'right' }} className={classNames({ [classes.errorText]: swapError })}>
                            allowance:{' '}
                            <Loading loading={isLoading}>
                              <span title={toFixed(allowances[index], decimal)}>{toFixed(allowances[index], decimal, 6)}</span>
                            </Loading>
                          </span>
                        </p>
                      )}
                      {swapError && (
                        <div className={classes.swapError}>
                          <span>swap path fetch error</span>
                          <ReplayIcon fontSize="small" style={{ cursor: 'pointer' }} onClick={reloadSwap} />
                        </div>
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
            <SimpleSelect className={classes.select} value={receiveToken} onChange={setReceiveToken} options={selectOptions} />
            <div className={classes.estimateBalance}>
              <Loading loading={isEstimate}>
                <div className={classes.textOverflow}>{toFixed(receiveAmount, receiveTokenDecimals, 6)}</div>
                <div>{receiveTokenAmount !== '0' && `+(${toFixed(receiveTokenAmount, receiveTokenDecimals, 6)})`}</div>
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
              value={slipper}
              placeholder="Allow slipper percent"
              maxEndAdornment
              onMaxClick={() => onSlippageChange('45')}
              onChange={event => {
                const { value } = event.target
                onSlippageChange(value)
              }}
              error={(!isUndefined(isValidSlipper()) && !isValidSlipper()) || (!isStaticCallLoading && isStaticCallError)}
            />
          </span>
        </h3>
        <div className={classes.buttonGroup}>
          <Button
            color="colorfull"
            onClick={swap}
            disabled={(!isStaticCallLoading && isStaticCallError) || noNeedSwap || someNotApprove || isEstimate || isSwapError()}
            className={classes.okButton}
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
