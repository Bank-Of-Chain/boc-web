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

// === Utils === //
import { useDispatch } from 'react-redux'
import * as ethers from 'ethers'
import get from 'lodash/get'
import map from 'lodash/map'
import some from 'lodash/some'
import isNil from 'lodash/isNil'
import every from 'lodash/every'
import assign from 'lodash/assign'
import reduce from 'lodash/reduce'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
import findIndex from 'lodash/findIndex'
import { toFixed } from '@/helpers/number-format'
import { getBestSwapInfo } from 'piggy-finance-utils'
import BN from 'bignumber.js'
import { warmDialog } from '@/reducers/meta-reducer'

// === Constants === //
import { IERC20_ABI, EXCHANGE_EXTRA_PARAMS, ORACLE_ADDITIONAL_SLIPPAGE, USDT_ADDRESS, USDC_ADDRESS, DAI_ADDRESS } from '@/constants'

// === Styles === //
import styles from './style'
import { compact } from 'lodash'

const { Contract, BigNumber } = ethers
const useStyles = makeStyles(styles)

const ApproveArray = props => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { userProvider, tokens, address: userAddress, exchangeManager, EXCHANGE_AGGREGATOR_ABI, slipper, EXCHANGE_ADAPTER_ABI, handleClose } = props
  const [receiveToken, setReceiveToken] = useState(USDT_ADDRESS)
  const [receiveAmount, setReceiveAmount] = useState(BigNumber.from(0))
  const [isEstimate, setIsEstimate] = useState(false)
  const [values, setValues] = useState([])
  const [balances, setBalances] = useState([])
  const [decimals, setDecimals] = useState([])
  const [allowances, setAllowances] = useState([])
  const [swapArray, setSwapArray] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const receiveTokenDecimals = get(decimals, findIndex(tokens, { address: receiveToken }), 0)

  const getExchangePlatformAdapters = async (exchangeAggregator, userProvider) => {
    const { _exchangeAdapters: adapters } = await exchangeAggregator.getExchangeAdapters()
    const exchangePlatformAdapters = {}
    for (const address of adapters) {
      const contract = new ethers.Contract(address, EXCHANGE_ADAPTER_ABI, userProvider)
      exchangePlatformAdapters[await contract.identifier()] = address
    }
    return exchangePlatformAdapters
  }

  const selectOptions = [
    {
      label: 'USDT',
      value: USDT_ADDRESS,
      img: `./images/${USDT_ADDRESS}.png`
    },
    {
      label: 'USDC',
      value: USDC_ADDRESS,
      img: `./images/${USDC_ADDRESS}.png`
    },
    {
      label: 'DAI',
      value: DAI_ADDRESS,
      img: `./images/${DAI_ADDRESS}.png`
    }
  ]

  async function reload(tokens = [], userAddress, exchangeManager) {
    if (isEmpty(tokens) || isEmpty(exchangeManager) || isEmpty(userAddress)) {
      return
    }
    setIsLoading(true)
    const array = await Promise.all(
      map(tokens, async token => {
        const { address, amount } = token
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
    const { allowances, balances, decimals, values } = reduce(
      array,
      (rs, item, i) => {
        const { allowance, balance, amount, decimal } = item
        rs.amounts[i] = amount
        rs.balances[i] = balance
        rs.decimals[i] = BigNumber.from(10).pow(decimal)
        rs.allowances[i] = allowance
        rs.values[i] = toFixed(amount, BigNumber.from(10).pow(decimal))
        return rs
      },
      {
        allowances: [],
        balances: [],
        amounts: [],
        decimals: [],
        values: []
      }
    )
    setValues(values)
    setBalances(balances)
    setDecimals(decimals)
    setAllowances(allowances)
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
    if (isEmpty(token) || isNil(value) || value === '0') return Promise.reject()
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
    const allowanceAmount = await contractWithUser.allowance(address, userAddress)
    // If deposit amount greater than allow amount, reset amount
    if (nextValue.gt(allowanceAmount)) {
      // If allowance equal 0, approve nextAmount, otherwise approve 0 and approve nextAmount
      if (allowanceAmount.gt(0)) {
        console.log('add allowance:', nextValue.sub(allowanceAmount).toString())
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

    const someNotApprove = some(tokens, (token, index) => {
      const allowance = allowances[index]
      const decimal = decimals[index]
      const value = values[index]
      if (isEmpty(allowance) || isEmpty(decimal) || isEmpty(value)) return false
      let nextValue
      try {
        nextValue = BigNumber.from(new BN(value).multipliedBy(decimal.toString()).toFixed())
        return nextValue.gt(BigNumber.from(allowance))
      } catch (error) {
        return false
      }
    })
    if (someNotApprove) {
      return dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Approval all tokens firstly!'
        })
      )
    }
    const nextSwapArray = map(compact(swapArray), i => {
      const { bestSwapInfo, info } = i
      return {
        platform: bestSwapInfo.platform,
        method: bestSwapInfo.method,
        data: bestSwapInfo.encodeExchangeArgs,
        swapDescription: info
      }
    })
    const constract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
    const signer = userProvider.getSigner()
    constract
      .connect(signer)
      .batchSwap(nextSwapArray)
      .then(tx => tx.wait())
      .then(handleClose)
  }

  const estimateWithValue = useCallback(
    debounce(async (values = [], decimals = [], receiveToken) => {
      if (isEmpty(receiveToken)) return
      setIsEstimate(true)
      const exchangeManagerContract = new Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
      const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract, userProvider)
      const requestArray = map(tokens, async (token, index) => {
        const value = values[index]
        const decimal = decimals[index]
        if (isNil(decimal) || isNil(value) || value === '0' || token.address === receiveToken) return
        const swapAmount = BigNumber.from(new BN(value).multipliedBy(decimal.toString()).toFixed())
        const fromTokenConstract = new Contract(token.address, IERC20_ABI, userProvider)
        const toTokenConstract = new Contract(receiveToken, IERC20_ABI, userProvider)
        const bestSwapInfo = await getBestSwapInfo(
          {
            decimals: parseInt((await fromTokenConstract.decimals()).toString()),
            address: token.address
          },
          {
            decimals: parseInt((await toTokenConstract.decimals()).toString()),
            address: receiveToken
          },
          swapAmount,
          parseInt(100 * parseFloat(slipper)) || 0,
          ORACLE_ADDITIONAL_SLIPPAGE,
          exchangePlatformAdapters,
          assign(EXCHANGE_EXTRA_PARAMS, isEmpty(exchangePlatformAdapters.testAdapter) ? {} : { testAdapter: {} })
        )
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
      const bestSwapInfoArray = await Promise.all(requestArray)
      const nextReceiveAmount = reduce(
        bestSwapInfoArray,
        (rs, item) => {
          return rs.add(BigNumber.from(get(item, 'bestSwapInfo.toTokenAmount', '0')))
        },
        BigNumber.from(0)
      )
      setIsEstimate(false)
      setSwapArray(bestSwapInfoArray)
      setReceiveAmount(nextReceiveAmount)
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
  }, [isLoading, values, decimals, receiveToken])

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <h2>Swap into one token</h2>
      </GridItem>
      <GridItem xs={12} sm={12} md={12}>
        <GridContainer spacing={1}>
          <GridItem xs={12} sm={12} md={8} style={{ overflow: 'auto', border: '1px solid #A68EFE' }}>
            <GridContainer className={classes.approveContainer}>
              {map(tokens, ({ address, amount }, index) => {
                const isReciveToken = address === receiveToken
                if (amount === '0' || isReciveToken) return
                const value = values[index] || ''
                const balance = balances[index]
                const decimal = decimals[index]
                const allowance = allowances[index]
                const swapError = swapArray[index] instanceof Error
                const isValid = isEmpty(value) || new BN(balance).gte(value)
                return (
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    key={address}
                    className={classNames({ [classes.errorContainer]: swapError, [classes.reciveContainer]: isReciveToken })}
                  >
                    <div className={classes.approveItem}>
                      <CustomTextField
                        classes={{ root: classes.input }}
                        value={value}
                        onChange={event => handleInputChange(event.target.value, index)}
                        placeholder="approve amount"
                        maxEndAdornment
                        InputProps={{
                          startAdornment: <img className={classes.tokenLogo} src={`./images/${address}.png`} />
                        }}
                        onMaxClick={() => handleInputChange(toFixed(balance, decimal), index)}
                        error={!isValid}
                      />
                      <Button
                        className={classes.approveButton}
                        color="colorfull"
                        disabled={isReciveToken || value === toFixed(allowance, decimal)}
                        onClick={() => approveValue(index).then(() => reload(tokens, userAddress, exchangeManager))}
                      >
                        approve
                      </Button>
                    </div>
                    {!isReciveToken && (
                      <p className={classes.balanceText}>
                        balance: <Loading loading={isLoading}>{toFixed(balances[index], decimal)}</Loading>
                        <span style={{ float: 'right', marginRight: '0.5rem' }} className={classNames({ [classes.errorText]: swapError })}>
                          allowance: <Loading loading={isLoading}>{toFixed(allowances[index], decimal)}</Loading>
                        </span>
                      </p>
                    )}
                    {swapError && <p className={classNames(classes.errorText, classes.balanceText)}>swap path fetch error</p>}
                  </GridItem>
                )
              })}
            </GridContainer>
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <SimpleSelect className={classes.select} value={receiveToken} onChange={setReceiveToken} options={selectOptions} />
            <Loading loading={isEstimate}>
              <p>{toFixed(receiveAmount, receiveTokenDecimals, 6)}</p>
            </Loading>
          </GridItem>
        </GridContainer>
      </GridItem>
      <GridItem xs={12} sm={12} md={12}>
        <p>
          <span className={classes.left}>Slippage tolerance: </span>
          <span className={classes.rigth}>{toFixed(`${slipper}`, 10 ** 2, 2)}%</span>
        </p>
        <p>
          <span className={classes.left}>Estimated gas fee:</span> <span className={classes.rigth}>15.5usd</span>
        </p>
      </GridItem>
      <GridItem xs={12} sm={12} md={12}>
        <Button color="colorfull" onClick={swap} style={{ width: '50%' }}>
          One Coin
        </Button>
        <Button color="danger" style={{ marginLeft: '1rem' }} onClick={handleClose}>
          Cancel
        </Button>
      </GridItem>
    </GridContainer>
  )
}

export default ApproveArray
