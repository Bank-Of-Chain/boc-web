import React, { useState } from 'react'
import * as ethers from 'ethers'
import BN from 'bignumber.js'
import { useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Step from '@material-ui/core/Step'
import WarningIcon from '@material-ui/icons/Warning'

import CustomTextField from '@/components/CustomTextField'
import BocStepper from '@/components/Stepper/Stepper'
import BocStepLabel from '@/components/Stepper/StepLabel'
import BocStepIcon from '@/components/Stepper/StepIcon'
import BocStepConnector from '@/components/Stepper/StepConnector'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Button from '@/components/CustomButtons/Button'
import Loading from '@/components/LoadingComponent'

// === Hooks === //
import { warmDialog } from '@/reducers/meta-reducer'

// === Utils === //
import isUndefined from 'lodash/isUndefined'
import map from 'lodash/map'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import {  formatBalance } from '@/helpers/number-format'
import { isAd, isEs, isRp, isMaxLoss, isLossMuch, isExchangeFail, errorTextOutput } from '@/helpers/error-handler'

// === Constants === //
import { MULTIPLE_OF_GAS, MAX_GAS_LIMIT } from '@/constants'

// === Styles === //
import styles from './style'

const { Contract, BigNumber } = ethers
const useStyles = makeStyles(styles)

const steps = [{ title: 'Shares Validation' }, { title: 'Gas Estimates' }, { title: 'Withdraw' }]

export default function Withdraw({
  userProvider,
  VAULT_ADDRESS,
  VAULT_ABI,
  isBalanceLoading,
  reloadBalance,
  estimatedTotalAssets,
  wantTokenDecimals,
  wantTokenSymbol
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [toValue, setToValue] = useState('')
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [withdrawError, setWithdrawError] = useState({})

  const withdraw = async () => {
    setIsWithdrawLoading(true)
    console.log('----------start withdraw----------')
    if (!isValidToValue()) {
      return setWithdrawError({
        type: 'warning',
        message: 'Please enter the correct value.'
      })
    }
    setCurrentStep(1)
    const vaultContract = new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const signer = userProvider.getSigner()
    try {
      const vaultContractWithSigner = vaultContract.connect(signer)
      setCurrentStep(2)
      let tx
      const withdrawAmount = BigNumber.from(BN(toValue).times(BN(10).pow(wantTokenDecimals)).toString())
      // if gasLimit times not 1, need estimateGas
      if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
        const gas = await vaultContractWithSigner.estimateGas.redeem(withdrawAmount, estimatedTotalAssets)
        setCurrentStep(3)
        const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
        // gasLimit not exceed maximum
        const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
        tx = await vaultContractWithSigner.redeem(withdrawAmount, estimatedTotalAssets, {
          gasLimit: maxGasLimit
        })
      } else {
        tx = await vaultContractWithSigner.redeem(withdrawAmount, estimatedTotalAssets)
      }

      const { events } = await tx.wait()
      let args = []
      for (let i = events.length - 1; i >= 0; i--) {
        if (events[i].event === 'Redeem') {
          args = events[i].args
          break
        }
      }
      console.log('args', args)
      const { _redeemAmount } = args
      console.log('_redeemAmount', _redeemAmount.toString())
      setCurrentStep(4)
      setToValue('')
      dispatch(
        warmDialog({
          open: true,
          type: 'success',
          message: `Withdraw ${formatBalance(_redeemAmount, wantTokenDecimals)} ${wantTokenSymbol}`
        })
      )
    } catch (error) {
      console.log('withdraw original error :', error)
      const errorMsg = errorTextOutput(error)
      let tip = ''
      if (isEs(errorMsg)) {
        tip = 'Vault has been shut down, please try again later!'
      } else if (isAd(errorMsg)) {
        tip = 'Vault is in adjustment status, please try again later!'
      } else if (isRp(errorMsg)) {
        tip = 'Vault is in rebase status, please try again later!'
      } else if (isMaxLoss(errorMsg)) {
        tip = 'Failed to withdraw, please increase the Max Loss!'
      } else if (isLossMuch(errorMsg)) {
        tip = 'Failed to exchange, please increase the exchange slippage!'
      } else if (isExchangeFail(errorMsg)) {
        tip = 'Failed to exchange, Please try again later!'
      } else {
        tip = 'Withdraw failed'
      }
      dispatch(
        warmDialog({
          open: true,
          type: 'error',
          message: tip
        })
      )
    }
    setTimeout(() => {
      setIsWithdrawLoading(false)
      setWithdrawError({})
      setCurrentStep(0)
    }, 2000)
  }

  /**
   * check if toValue is valid
   * @returns
   */
  const isValidToValue = () => {
    if (toValue === '' || toValue === '-' || isEmpty(toValue.replace(/ /g, ''))) return
    // should be a number
    if (isNaN(Number(toValue))) return false
    const nextValue = BN(toValue)
    const nextToValue = nextValue.multipliedBy(BigNumber.from(10).pow(wantTokenDecimals).toString())
    // should be positive
    if (nextToValue.lte(0)) return false
    // should be integer
    const nextToValueString = nextValue.multipliedBy(BigNumber.from(10).pow(wantTokenDecimals).toString())
    if (nextToValueString.toFixed().indexOf('.') !== -1) return false
    // balance less than value
    if (estimatedTotalAssets.lt(BigNumber.from(nextToValue.toFixed()))) return false
    return true
  }

  const handleAmountChange = event => {
    try {
      setToValue(event.target.value)
    } catch (error) {
      setToValue('')
    }
  }

  const handleMaxClick = async () => {
    const [nexttotalAsset] = await reloadBalance()
    setToValue(formatBalance(nexttotalAsset, wantTokenDecimals, { showAll: true }))
  }

  const isValidToValueFlag = isValidToValue()

  const isLogin = !isEmpty(userProvider)

  return (
    <>
      <GridContainer className={classes.withdrawContainer}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText}>From</p>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.inputLabelWrapper}>
            <div className={classes.tokenInfo}>
              <span className={classes.tokenName}>{wantTokenSymbol} VAULT</span>
            </div>
            <CustomTextField
              classes={{ root: classes.input }}
              value={toValue}
              placeholder="withdraw amount"
              maxEndAdornment
              onMaxClick={() => handleMaxClick()}
              onChange={handleAmountChange}
              error={!isUndefined(isValidToValueFlag) && !isValidToValueFlag && toValue !== '0'}
            />
          </div>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText} title={formatBalance(estimatedTotalAssets, wantTokenDecimals, { showAll: true })}>
            Balance:&nbsp;
            <Loading loading={isBalanceLoading}>{formatBalance(estimatedTotalAssets, wantTokenDecimals)}</Loading>
          </p>
        </GridItem>
      </GridContainer>
      <GridContainer className={classes.outputContainer}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText}>To</p>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.estimateWrapper}>
            <span>{wantTokenSymbol}</span>
            <span className={classes.estimateBalanceNum}>{toValue}</span>
          </div>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.footerContainer}>
            <Button
              disabled={!isLogin || (isLogin && (isUndefined(isValidToValueFlag) || !isValidToValueFlag))}
              color="colorfull"
              onClick={withdraw}
              style={{ width: '100%', padding: '12px 16px' }}
            >
              Withdraw
            </Button>
          </div>
        </GridItem>
      </GridContainer>
      <Modal className={classes.modal} open={isWithdrawLoading} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <Paper elevation={3} className={classes.widthdrawLoadingPaper}>
          <div className={classes.modalBody}>
            {isEmpty(withdrawError) && <CircularProgress color="inherit" />}
            {isEmpty(withdrawError) ? <p>In Withdrawing...</p> : <p>Withdraw Error !</p>}
            <BocStepper
              classes={{
                root: classes.root
              }}
              alternativeLabel
              activeStep={currentStep}
              connector={<BocStepConnector />}
            >
              {map(steps, (i, index) => {
                return (
                  <Step key={index}>
                    <BocStepLabel StepIconComponent={BocStepIcon}>{i.title}</BocStepLabel>
                  </Step>
                )
              })}
            </BocStepper>
            {!isEmpty(withdrawError) && (
              <p
                style={{
                  color: withdrawError.type === 'error' ? 'red' : 'yellow'
                }}
              >
                <WarningIcon style={{ verticalAlign: 'bottom' }}></WarningIcon>
                &nbsp;&nbsp;&nbsp;{withdrawError.message}
              </p>
            )}
            <Button
              color="danger"
              onClick={() => {
                setIsWithdrawLoading(false)
                setWithdrawError({})
                setCurrentStep(0)
              }}
            >
              Cancel
            </Button>
          </div>
        </Paper>
      </Modal>
    </>
  )
}
