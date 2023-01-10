import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as ethers from 'ethers'
import BN from 'bignumber.js'
import { useDispatch } from 'react-redux'
import isUndefined from 'lodash/isUndefined'
import debounce from 'lodash/debounce'
import isEmpty from 'lodash/isEmpty'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import CircularProgress from '@material-ui/core/CircularProgress'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Loading from '@/components/LoadingComponent'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import CustomTextField from '@/components/CustomTextField'
import Button from '@/components/CustomButtons/Button'

// === Utils === //
import noop from 'lodash/noop'
import { isAd, isEs, isRp, isDistributing, errorTextOutput } from '@/helpers/error-handler'
import { warmDialog } from '@/reducers/meta-reducer'
import { toFixed, formatBalance } from '@/helpers/number-format'

// === Hooks === //
import usePool from '@/hooks/usePool'
import useErc20Token from '@/hooks/useErc20Token'

// === Constants === //
import { WETH_ADDRESS } from '../../../constants/tokens'

// === Styles === //
import styles from './style'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

export default function Deposit({
  dieselBalance,
  dieselDecimals,
  wethBalance,
  wethDecimals,
  userProvider,
  onCancel,
  POOL_ADDRESS,
  POOL_SERVICE_ABI,
  wethBalanceLoading
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [ethValue, setEthValue] = useState('')
  const [mintGasLimit] = useState(BigNumber.from(0))
  const [gasPriceCurrent, setGasPriceCurrent] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [isEstimate, setIsEstimate] = useState(false)
  const [estimateVaultBuffValue, setEstimateVaultBuffValue] = useState(BigNumber.from(0))
  const loadingTimer = useRef()

  const { approve } = useErc20Token(WETH_ADDRESS, userProvider)

  const { addLiquidity } = usePool(POOL_ADDRESS, POOL_SERVICE_ABI, userProvider)

  console.log('mintGasLimit=', dieselBalance)

  const getGasFee = () => {
    if (!gasPriceCurrent) {
      return BigNumber.from(0)
    }
    const gasPrice = BigNumber.from(parseInt(gasPriceCurrent, 16).toString())
    // metamask gaslimit great than contract gaslimit, so add extra limit
    const metamaskExtraLimit = 114
    return mintGasLimit.add(metamaskExtraLimit).mul(gasPrice)
  }

  /**
   * check if value is valid
   * @returns
   */
  function isValidValue() {
    const balance = wethBalance
    const decimals = wethDecimals
    const value = ethValue
    if (value === '' || value === '-' || value === '0' || isEmpty(value.replace(/ /g, ''))) return
    // not a number
    if (isNaN(Number(value))) return false
    const nextValue = BN(value)
    const nextFromValue = nextValue.multipliedBy(BigNumber.from(10).pow(decimals).toString())
    // less than 0
    if (nextFromValue.lte(0)) return false
    // value should be integer
    const nextFromValueString = nextValue.multipliedBy(BigNumber.from(10).pow(decimals).toString())
    if (nextFromValueString.toFixed().indexOf('.') !== -1) return false
    // balance less than value
    if (balance.lt(BigNumber.from(nextFromValue.toFixed()))) return false

    if (balance.sub(BigNumber.from(nextFromValue.toFixed())).lt(getGasFee())) return false

    return true
  }

  const handleInputChange = event => {
    setIsEstimate(true)
    setEthValue(event.target.value)
  }

  const handleMaxClick = () => {
    const v = getGasFee()
    if (v.lte(0)) {
      dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Since the latest Gasprice is not available, it is impossible to estimate the gas fee currently!'
        })
      )
      return
    }
    const maxValue = wethBalance.sub(v)
    const maxBalance = formatBalance(maxValue.gt(0) ? maxValue : 0, wethDecimals, {
      showAll: true
    })
    if (maxValue === ethValue) {
      return
    }
    setIsEstimate(true)
    setEthValue(maxBalance)
  }

  const deposit = async () => {
    clearTimeout(loadingTimer.current)
    const isValid = isValidValue()
    if (!isValid) {
      return dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Please enter the correct value'
        })
      )
    }
    setIsLoading(true)
    const amount = BigNumber.from(BN(ethValue).multipliedBy(BigNumber.from(10).pow(wethDecimals).toString()).toFixed())
    let isSuccess = false

    // approve value
    await approve(POOL_ADDRESS, amount)

    console.log('approve success')
    const errorHandle = error => {
      const errorMsg = errorTextOutput(error)
      let tip = ''
      if (isEs(errorMsg)) {
        tip = 'Vault has been shut down, please try again later!'
      } else if (isAd(errorMsg)) {
        tip = 'Vault is in adjustment status, please try again later!'
      } else if (isRp(errorMsg)) {
        tip = 'Vault is in rebase status, please try again later!'
      } else if (isDistributing(errorMsg)) {
        tip = 'Vault is in distributing, please try again later!'
      }
      if (tip) {
        dispatch(
          warmDialog({
            open: true,
            type: 'error',
            message: tip
          })
        )
      }
      setIsLoading(false)
    }
    await addLiquidity(amount)
      .then(tx => tx.wait())
      .then(() => {
        isSuccess = true
      })
      .catch(errorHandle)

    if (isSuccess) {
      setEthValue('')
    }

    loadingTimer.current = setTimeout(() => {
      setIsLoading(false)
      if (isSuccess) {
        dispatch(
          warmDialog({
            open: true,
            type: 'success',
            message: 'Success!'
          })
        )
      }
    }, 2000)
  }

  const estimateMint = useCallback(
    debounce(async () => {
      const isValid = isValidValue()
      if (!isValid) {
        setIsEstimate(false)
        setEstimateVaultBuffValue(BigNumber.from(0))
        return
      }
      // const vaultContract = new ethers.Contract(POOL_ADDRESS, POOL_SERVICE_ABI, userProvider)
      // const amount = BigNumber.from(BN(ethValue).multipliedBy(BigNumber.from(10).pow(ethDecimals).toString()).toFixed())
      // const result = await vaultContract.estimateMint(amount).catch(error => {
      //   const errorMsg = errorTextOutput(error)
      //   let tip = ''
      //   if (isEs(errorMsg)) {
      //     tip = 'Vault has been shut down, please try again later!'
      //   } else if (isAd(errorMsg)) {
      //     tip = 'Vault is in adjustment status, please try again later!'
      //   } else if (isRp(errorMsg)) {
      //     tip = 'Vault is in rebase status, please try again later!'
      //   } else if (isDistributing(errorMsg)) {
      //     tip = 'Vault is in distributing, please try again later!'
      //   }
      //   if (tip) {
      //     dispatch(
      //       warmDialog({
      //         open: true,
      //         type: 'error',
      //         message: tip
      //       })
      //     )
      //   }
      //   return BigNumber.from(0)
      // })
      // setEstimateVaultBuffValue(result)
      setIsEstimate(false)
    }, 1500)
  )

  useEffect(() => {
    estimateMint()
    return () => estimateMint.cancel()
  }, [ethValue])

  // get gasprice per 15s
  useEffect(() => {
    if (!userProvider) {
      return
    }
    userProvider.send('eth_gasPrice').then(setGasPriceCurrent).catch(noop)
    const timer = setInterval(() => {
      userProvider.send('eth_gasPrice').then(setGasPriceCurrent).catch(noop)
    }, 15000)
    return () => clearInterval(timer)
  }, [userProvider])

  const isLogin = !isEmpty(userProvider)
  const isValid = isValidValue()

  return (
    <>
      <GridContainer spacing={3}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.wrapper}>
            <GridContainer classes={{ root: classes.depositContainer }}>
              <p className={classes.estimateText}>From</p>
              <GridItem xs={12} sm={12} md={12} lg={12} className={classes.tokenInputWrapper}>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12} lg={12}>
                    <GridContainer justify="center" spacing={2}>
                      <GridItem xs={4} sm={4} md={4} lg={4}>
                        <div className={classes.tokenInfo}>
                          <img className={classes.tokenLogo} alt="" src={`./images/${WETH_ADDRESS}.png`} />
                          <span className={classes.tokenName}>WETH</span>
                        </div>
                      </GridItem>
                      <GridItem xs={8} sm={8} md={8} lg={8}>
                        <CustomTextField
                          classes={{ root: classes.input }}
                          value={ethValue}
                          onChange={handleInputChange}
                          placeholder="deposit amount"
                          maxEndAdornment
                          onMaxClick={handleMaxClick}
                          error={!isUndefined(isValid) && !isValid}
                        />
                      </GridItem>
                    </GridContainer>
                  </GridItem>
                  <GridItem xs={12} sm={12} md={12} lg={12}>
                    <div
                      className={classes.balance}
                      title={formatBalance(wethBalance, wethDecimals, {
                        showAll: true
                      })}
                    >
                      Balance:&nbsp;&nbsp;
                      <Loading loading={wethBalanceLoading}>{formatBalance(wethBalance, wethDecimals)}</Loading>
                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
            </GridContainer>
            <GridContainer classes={{ root: classes.estimateContainer }}>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <p className={classes.estimateText}>To</p>
                <div className={classes.estimateBalanceTitle}>
                  Diesel Token
                  <span className={classes.estimateBalanceNum}>
                    <Loading loading={isEstimate}>{toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(dieselDecimals))}</Loading>
                  </span>
                </div>
                <p className={classes.estimateText}>Estimated Gas Fee: {toFixed(getGasFee(), BigNumber.from(10).pow(wethDecimals), 6)} ETH</p>
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <div className={classes.buttonGroup}>
                  <Button disabled={!isLogin || (isLogin && !isValid)} color="colorful" onClick={deposit} className={classes.blockButton}>
                    Deposit
                  </Button>
                  <Button color="danger" onClick={onCancel} className={classes.blockButton}>
                    Cancel
                  </Button>
                </div>
              </GridItem>
            </GridContainer>
          </div>
        </GridItem>
      </GridContainer>
      <Modal className={classes.modal} open={isLoading} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <Paper elevation={3} className={classes.depositModal}>
          <div className={classes.modalBody}>
            <CircularProgress color="inherit" />
            <p>On Deposit...</p>
          </div>
        </Paper>
      </Modal>
    </>
  )
}
