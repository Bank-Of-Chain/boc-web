import React, { useState, useEffect } from 'react'
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
import useUserAddress from '@/hooks/useUserAddress'
import { warmDialog } from '@/reducers/meta-reducer'
import useCreditFacade from '@/hooks/useCreditFacade'
import useErc20Token from '@/hooks/useErc20Token'

// === Services === //
import { removeFromVaultSuccess } from '@/services/keeper-service'

// === Utils === //
import isUndefined from 'lodash/isUndefined'
import map from 'lodash/map'
import isEmpty from 'lodash/isEmpty'
import { formatBalance } from '@/helpers/number-format'
import { isCantWithdrawException, errorTextOutput } from '@/helpers/error-handler'

// === Constants === //
import WithdrawFromVault from '@/constants/leverage'

// === Styles === //
import styles from './style'
import { toFixed } from '../../../helpers/number-format'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

const steps = [{ title: 'Shares Validation' }, { title: 'Gas Estimates' }, { title: 'Withdraw' }]

const LeverWithdraw = ({ userProvider, ETHI_ADDRESS, VAULT_BUFFER_ADDRESS, CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, onCancel }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const address = useUserAddress(userProvider)
  const [toValue, setToValue] = useState('')
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [withdrawError, setWithdrawError] = useState({})

  const { withdrawFromVault, creditAddress, getCreditAccountPegTokenAmount } = useCreditFacade(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)

  const [ethiBalance, setEthiBalance] = useState(BigNumber.from(0))
  const [, setEthiVaultBufferBalance] = useState(BigNumber.from(0))

  const { decimals: ethiDecimals, loading: isEthiBalanceLoading } = useErc20Token(ETHI_ADDRESS, userProvider)
  const { balanceOf: getEthiVaultBufferBalance } = useErc20Token(VAULT_BUFFER_ADDRESS, userProvider)

  const withdraw = async () => {
    let withdrawTimeStart = Date.now(),
      withdrawValidFinish = 0,
      preWithdrawGetCoins = 0,
      getSwapInfoFinish = 0,
      estimateGasFinish = 0,
      withdrawFinish = 0,
      withdrawTransationFinish = 0
    setIsWithdrawLoading(true)
    console.log('----------start withdraw----------')
    if (!isValidToValue()) {
      return setWithdrawError({
        type: 'warning',
        message: 'Please enter the correct value.'
      })
    }

    withdrawValidFinish = Date.now()
    setCurrentStep(1)
    const nextValue = BigNumber.from(BN(toValue).multipliedBy(BigNumber.from(10).pow(ethiDecimals).toString()).toFixed())
    try {
      getSwapInfoFinish = Date.now()
      setCurrentStep(2)
      await withdrawFromVault(nextValue, ethiBalance, WithdrawFromVault.WITHDRAW).then(() => {
        removeFromVaultSuccess(address, WithdrawFromVault.WITHDRAW)
      })
      withdrawFinish = Date.now()

      withdrawTransationFinish = Date.now()
      setCurrentStep(4)
      setToValue('')
      onCancel()
      dispatch(
        warmDialog({
          open: true,
          type: 'success',
          message: 'Success!'
        })
      )
    } catch (error) {
      console.log('withdraw original error :', error)
      const errorMsg = errorTextOutput(error)
      let tip = ''
      if (isCantWithdrawException(errorMsg)) {
        tip = 'Withdrawal failed!'
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
    }
    setTimeout(() => {
      setIsWithdrawLoading(false)
      setWithdrawError({})
      setCurrentStep(0)
    }, 2000)
    // log withdraw total time
    const totalTime = withdrawTransationFinish - withdrawTimeStart
    const szjy = withdrawValidFinish - withdrawTimeStart
    const szjyPercents = ((100 * szjy) / totalTime).toFixed(2)
    const ytq = preWithdrawGetCoins === 0 ? 0 : preWithdrawGetCoins - withdrawValidFinish
    const ytqPercents = ((100 * ytq) / totalTime).toFixed(2)
    const hqdhlj = preWithdrawGetCoins === 0 ? getSwapInfoFinish - withdrawValidFinish : getSwapInfoFinish - preWithdrawGetCoins
    const hqdhljPercents = ((100 * hqdhlj) / totalTime).toFixed(2)
    const eg = estimateGasFinish === 0 ? 0 : estimateGasFinish - getSwapInfoFinish
    const egPercents = ((100 * eg) / totalTime).toFixed(2)
    const qk = estimateGasFinish === 0 ? withdrawFinish - getSwapInfoFinish : withdrawFinish - estimateGasFinish
    const qkPercents = ((100 * qk) / totalTime).toFixed(2)
    const swc = withdrawTransationFinish - withdrawFinish
    const swcPercents = ((100 * swc) / totalTime).toFixed(2)
    console.table({
      valid: `${szjy}(${szjyPercents}%)`,
      preWithdraw: `${ytq}(${ytqPercents}%)`,
      getSwapPath: `${hqdhlj}(${hqdhljPercents}%)`,
      estimateGas: `${eg}(${egPercents}%)`,
      withdraw: `${qk}(${qkPercents}%)`,
      transaction: `${swc}(${swcPercents}%)`
    })
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
    const nextToValue = nextValue.multipliedBy(BigNumber.from(10).pow(ethiDecimals).toString())
    // should be positive
    if (nextToValue.lte(0)) return false
    // should be integer
    const nextToValueString = nextValue.multipliedBy(BigNumber.from(10).pow(ethiDecimals).toString())
    if (nextToValueString.toFixed().indexOf('.') !== -1) return false
    // balance less than value
    if (ethiBalance.lt(BigNumber.from(nextToValue.toFixed()))) return false
    return true
  }

  useEffect(() => {
    if (isEmpty(creditAddress)) return
    getCreditAccountPegTokenAmount(creditAddress).then(setEthiBalance)
  }, [getCreditAccountPegTokenAmount, creditAddress])

  useEffect(() => {
    if (isEmpty(creditAddress)) return
    getEthiVaultBufferBalance(creditAddress).then(setEthiVaultBufferBalance)
  }, [getEthiVaultBufferBalance, creditAddress])

  const handleAmountChange = event => {
    try {
      setToValue(event.target.value)
    } catch (error) {
      setToValue('')
    }
  }

  const handleMaxClick = async () => {
    setToValue(formatBalance(ethiBalance, ethiDecimals, { showAll: true }))
  }

  const isValidToValueFlag = isValidToValue()
  const isLogin = !isEmpty(userProvider)

  return (
    <>
      <GridContainer spacing={3}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.wrapper}>
            <GridContainer className={classes.withdrawContainer}>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <p className={classes.estimateText}>From</p>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <GridContainer justify="center" spacing={2}>
                  <GridItem xs={4} sm={4} md={4} lg={4}>
                    <div className={classes.tokenInfo}>
                      <span className={classes.tokenName}>ETHi</span>
                    </div>
                  </GridItem>
                  <GridItem xs={8} sm={8} md={8} lg={8}>
                    <CustomTextField
                      classes={{ root: classes.input }}
                      value={toValue}
                      placeholder="withdraw amount"
                      maxEndAdornment
                      onMaxClick={() => handleMaxClick()}
                      onChange={handleAmountChange}
                      error={!isUndefined(isValidToValueFlag) && !isValidToValueFlag && toValue !== '0'}
                    />
                  </GridItem>
                </GridContainer>
              </GridItem>
              <GridItem xs={6} sm={6} md={6} lg={6}>
                <p className={classes.estimateText} title={toFixed(ethiBalance, BigNumber.from(10).pow(ethiDecimals))}>
                  Balance:&nbsp;
                  <Loading loading={isEthiBalanceLoading}>{toFixed(ethiBalance, BigNumber.from(10).pow(ethiDecimals), 4)}</Loading>
                </p>
              </GridItem>
            </GridContainer>
            <GridContainer className={classes.outputContainer}>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <p>
                  After the withdrawal, the funds are temporarily stored in the credit account and can only be returned to the user after the
                  clearance of the keeper
                </p>
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <div className={classes.buttonGroup}>
                  <Button
                    disabled={!isLogin || (isLogin && (isUndefined(isValidToValueFlag) || !isValidToValueFlag))}
                    color="colorful"
                    onClick={withdraw}
                    className={classes.blockButton}
                  >
                    Withdraw
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
      <Modal className={classes.modal} open={isWithdrawLoading} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <Paper elevation={3} className={classes.widthdrawLoadingPaper}>
          <div className={classes.modalBody}>
            <div className={classes.itemTop}>
              {isEmpty(withdrawError) ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  <span className={classes.text}>Withdrawing...</span>
                </>
              ) : (
                <div>Withdraw Error !</div>
              )}
            </div>
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
              fullWidth={true}
              className={classes.cancelButton}
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

export default LeverWithdraw
