import React, { useState, useEffect, useCallback } from 'react'
import * as ethers from 'ethers'
import BN from 'bignumber.js'
import { useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
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
import SimpleSelect from '@/components/SimpleSelect'

// === Hooks === //
import { warmDialog } from '@/reducers/meta-reducer'
import useUserAddress from '@/hooks/useUserAddress'
import usePool from '@/hooks/usePool'

// === Utils === //
import isUndefined from 'lodash/isUndefined'
import map from 'lodash/map'
import debounce from 'lodash/debounce'
import isEmpty from 'lodash/isEmpty'
import { toFixed, formatBalance } from '@/helpers/number-format'
import { isAd, isEs, isRp, isMaxLoss, isLossMuch, isExchangeFail, errorTextOutput } from '@/helpers/error-handler'

// === Constants === //
import { WETH_ADDRESS } from '@/constants/tokens'
import { BN_18 } from '@/constants/big-number'

// === Styles === //
import styles from './style'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

const steps = [{ title: 'Shares Validation' }, { title: 'Gas Estimates' }, { title: 'Withdraw' }]

export default function Withdraw({
  dieselBalance,
  dieselDecimals,
  wethBalance,
  wethDecimals,
  userProvider,
  onCancel,
  reloadBalance,
  POOL_ADDRESS,
  POOL_SERVICE_ABI,
  dieselBalanceLoading
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [toValue, setToValue] = useState('')
  const [estimateWithdrawArray, setEstimateWithdrawArray] = useState([])
  const [isEstimate, setIsEstimate] = useState(false)
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [withdrawError, setWithdrawError] = useState({})

  const address = useUserAddress(userProvider)

  const { removeLiquidity } = usePool(POOL_ADDRESS, POOL_SERVICE_ABI, userProvider)

  // const [burnTokens, setBurnTokens] = useState([
  //   // {
  //   //   address: ETH_ADDRESS,
  //   //   amount: '10000000000000000000',
  //   //   symbol: 'ETH'
  //   // },
  //   // {
  //   //   address: WETH_ADDRESS,
  //   //   amount: '1000000000000000000',
  //   //   symbol: 'WETH'
  //   // }
  // ])
  console.log('WETH_ADDRESS=', WETH_ADDRESS, wethBalance, wethDecimals)
  const [isShowZipModal] = useState(false)

  const [pegTokenPrice] = useState(BN_18)

  const estimateWithdraw = useCallback(
    debounce(async () => {
      setIsEstimate(true)
      // const vaultContract = new ethers.Contract(POOL_ADDRESS, POOL_SERVICE_ABI, userProvider)
      // const nextValue = BigNumber.from(BN(toValue).multipliedBy(BigNumber.from(10).pow(dieselDecimals).toString()).toFixed())
      // const allowMaxLossValue = BigNumber.from(1)
      // const signer = userProvider.getSigner()
      // const vaultContractWithSigner = vaultContract.connect(signer)

      // try {
      //   const [tokens, amounts] = await vaultContractWithSigner.callStatic.burn(nextValue, allowMaxLossValue)
      //   console.log('estimate withdraw result:', tokens, amounts)

      //   setEstimateWithdrawArray([])
      // } catch (error) {
      //   console.log('estimate withdraw error', error)
      //   console.log('withdraw original error :', error)
      //   const errorMsg = errorTextOutput(error)
      //   let tip = ''
      //   if (isEs(errorMsg)) {
      //     tip = 'Vault has been shut down, please try again later!'
      //   } else if (isAd(errorMsg)) {
      //     tip = 'Vault is in adjustment status, please try again later!'
      //   } else if (isRp(errorMsg)) {
      //     tip = 'Vault is in rebase status, please try again later!'
      //   } else if (isMaxLoss(errorMsg)) {
      //     tip = 'Failed to withdraw, please increase the Max Loss!'
      //   } else if (isLossMuch(errorMsg)) {
      //     tip = 'Failed to exchange, please increase the exchange slippage!'
      //   } else if (isExchangeFail(errorMsg)) {
      //     tip = 'Failed to exchange, Please try again later!'
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
      //   setEstimateWithdrawArray(undefined)
      // } finally {
      //   setTimeout(() => {
      //     setIsEstimate(false)
      //   }, 500)
      // }
      setTimeout(() => {
        setIsEstimate(false)
      }, 500)
    }, 1500)
  )

  const handleBurn = async (a, b, c, d, tokens) => {
    console.log('handleBurn')
    console.log('tokens', tokens)
  }

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
    const nextValue = BigNumber.from(BN(toValue).multipliedBy(BigNumber.from(10).pow(dieselDecimals).toString()).toFixed())
    try {
      getSwapInfoFinish = Date.now()
      setCurrentStep(2)
      let tx = await removeLiquidity(nextValue)
      withdrawFinish = Date.now()

      const { events } = await tx.wait()
      let args = []
      for (let i = events.length - 1; i >= 0; i--) {
        if (events[i].event === 'Burn') {
          args = events[i].args
          break
        }
      }
      handleBurn(...args)

      withdrawTransationFinish = Date.now()
      setCurrentStep(4)
      setToValue('')
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
    const nextToValue = nextValue.multipliedBy(BigNumber.from(10).pow(dieselDecimals).toString())
    // should be positive
    if (nextToValue.lte(0)) return false
    // should be integer
    const nextToValueString = nextValue.multipliedBy(BigNumber.from(10).pow(dieselDecimals).toString())
    if (nextToValueString.toFixed().indexOf('.') !== -1) return false
    // balance less than value
    if (dieselBalance.lt(BigNumber.from(nextToValue.toFixed()))) return false
    return true
  }

  useEffect(() => {
    // need open advanced setting
    // allowLoss, toValue need valid
    if (isValidToValue()) {
      estimateWithdraw()
    }
    if (isEmpty(toValue)) {
      setEstimateWithdrawArray([])
    }
    return () => {
      setEstimateWithdrawArray([])
      return estimateWithdraw.cancel()
    }
  }, [toValue])

  const handleAmountChange = event => {
    try {
      setToValue(event.target.value)
    } catch (error) {
      setToValue('')
    }
  }

  const handleMaxClick = async () => {
    const nextEthiBalance = await reloadBalance()
    setToValue(formatBalance(nextEthiBalance, dieselDecimals, { showAll: true }))
  }

  const renderEstimate = () => {
    if (isEstimate) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.estimateItem}>
            <CircularProgress fontSize="large" color="primary" />
          </div>
        </GridItem>
      )
    }
    if (isUndefined(estimateWithdrawArray)) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.estimateItem}>
            <ErrorOutlineIcon fontSize="large" />
            <p>Amount estimate failed, please try again!</p>
          </div>
        </GridItem>
      )
    }
    if (isEmpty(estimateWithdrawArray) || isEmpty(toValue)) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.estimateItem}>
            <p style={{ fontSize: 26, textAlign: 'right' }}>0.00</p>
          </div>
        </GridItem>
      )
    }

    const options = map(estimateWithdrawArray, item => {
      return {
        label: item.symbol,
        value: item.tokenAddress,
        img: `./images/${item.tokenAddress}.png`
      }
    })

    return map(estimateWithdrawArray, item => {
      return (
        <GridItem key={item.tokenAddress} xs={12} sm={12} md={12} lg={12} style={{ paddingTop: '0.5rem' }}>
          <GridContainer justify="center" spacing={1}>
            <GridItem xs={4} sm={4} md={4} lg={4}>
              <SimpleSelect disabled value={item.tokenAddress} options={options} />
            </GridItem>
            <GridItem xs={8} sm={8} md={8} lg={8}>
              <CustomTextField
                classes={{ root: classes.input }}
                value={toFixed(item.amounts, BigNumber.from(10).pow(item.decimals), 6)}
                placeholder="withdraw amount"
                disabled
              />
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <p className={classes.estimateText} title={formatBalance(item.balance, item.decimals, { showAll: true })}>
                Balance:&nbsp;{formatBalance(item.balance, item.decimals)}
              </p>
            </GridItem>
          </GridContainer>
        </GridItem>
      )
    })
  }

  const isValidToValueFlag = isValidToValue()
  const isLogin = !isEmpty(userProvider)

  return (
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
                    <span className={classes.tokenName}>Diesel</span>
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
              <p className={classes.estimateText} title={formatBalance(dieselBalance, dieselDecimals, { showAll: true })}>
                Balance:&nbsp;
                <Loading loading={dieselBalanceLoading}>{formatBalance(dieselBalance, dieselDecimals)}</Loading>
              </p>
            </GridItem>
            {address && (
              <GridItem xs={6} sm={6} md={6} lg={6}>
                <p className={classes.estimateText} style={{ justifyContent: 'flex-end' }} title={toFixed(pegTokenPrice, BN_18)}>
                  <span>1 Diesel Token ≈ {toFixed(pegTokenPrice, BN_18, 6)}ETH</span>
                </p>
              </GridItem>
            )}
          </GridContainer>
          <GridContainer className={classes.outputContainer}>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <p className={classes.estimateText}>To</p>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              {renderEstimate()}
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
          <Modal
            className={classes.modal}
            open={isShowZipModal && !!address}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
          >
            <div className={classes.swapBody}>
              {/* {!isEmpty(address) && !isEmpty(exchangeManager) && (
                <ApproveArrayV3
                  isEthi
                  address={address}
                  tokens={burnTokens}
                  userProvider={userProvider}
                  exchangeManager={exchangeManager}
                  EXCHANGE_ADAPTER_ABI={EXCHANGE_ADAPTER_ABI}
                  EXCHANGE_AGGREGATOR_ABI={EXCHANGE_AGGREGATOR_ABI}
                  slippage={slipper}
                  onSlippageChange={setSlipper}
                  handleClose={() => setIsShowZipModal(false)}
                />
              )} */}
            </div>
          </Modal>
        </div>
      </GridItem>
    </GridContainer>
  )
}
