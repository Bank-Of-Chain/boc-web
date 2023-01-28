import React, { useState, useRef } from 'react'
import * as ethers from 'ethers'
import BN from 'bignumber.js'
import { useDispatch } from 'react-redux'
import isUndefined from 'lodash/isUndefined'
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
import { isAd, isEs, isRp, isDistributing, errorTextOutput } from '@/helpers/error-handler'
import { warmDialog } from '@/reducers/meta-reducer'
import { formatBalance } from '@/helpers/number-format'

// === Hooks === //
import usePoolService from '@/hooks/usePoolService'
import useErc20Token from '@/hooks/useErc20Token'

// === Constants === //
import { WETH_ADDRESS } from '../../../constants/tokens'

// === Styles === //
import styles from './style'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

export default function Deposit({ userProvider, onCancel, reloadBalance, POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, wethBalanceLoading }) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [ethValue, setEthValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const loadingTimer = useRef()

  const { approve, balance: wethBalance, decimals: wethDecimals } = useErc20Token(WETH_ADDRESS, userProvider)

  const { addLiquidity } = usePoolService(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)

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

    return true
  }

  const handleInputChange = event => {
    setEthValue(event.target.value)
  }

  const handleMaxClick = () => {
    const maxValue = wethBalance
    const maxBalance = formatBalance(maxValue.gt(0) ? maxValue : 0, wethDecimals, {
      showAll: true
    })
    if (maxValue === ethValue) {
      return
    }
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
    await approve(POOL_SERVICE_ADDRESS, amount)

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
      reloadBalance()
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
                          placeholder="supply amount"
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
              {/* <GridItem xs={12} sm={12} md={12} lg={12}>
                <p className={classes.estimateText}>
                  <Checkbox defaultChecked color="primary" inputProps={{ 'aria-label': 'secondary checkbox' }} /> Staking all of your Diesel tokens
                  into pool
                </p>
              </GridItem> */}
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <div className={classes.buttonGroup}>
                  <Button disabled={!isLogin || (isLogin && !isValid)} color="colorful" onClick={deposit} className={classes.blockButton}>
                    Supply
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
