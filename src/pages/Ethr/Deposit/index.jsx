import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as ethers from 'ethers'
import BN from 'bignumber.js'
import { useDispatch } from 'react-redux'
import isUndefined from 'lodash/isUndefined'
import debounce from 'lodash/debounce'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'
import isNumber from 'lodash/isNumber'
import moment from 'moment'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Step from '@material-ui/core/Step'
import BocStepper from '@/components/Stepper/Stepper'
import BocStepLabel from '@/components/Stepper/StepLabel'
import BocStepIcon from '@/components/Stepper/StepIcon'
import BocStepConnector from '@/components/Stepper/StepConnector'
import CircularProgress from '@material-ui/core/CircularProgress'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import InfoIcon from '@material-ui/icons/Info'
import Typography from '@material-ui/core/Typography'
import Loading from '@/components/LoadingComponent'

import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import CustomTextField from '@/components/CustomTextField'
import Button from '@/components/CustomButtons/Button'
import { warmDialog } from '@/reducers/meta-reducer'
import { toFixed, formatBalance } from '@/helpers/number-format'

// === Utils === //
import noop from 'lodash/noop'
import { getLastPossibleRebaseTime } from '@/helpers/time-util'
import { isAd, isEs, isRp, isDistributing, errorTextOutput, isLessThanMinValue } from '@/helpers/error-handler'
import { BN_18 } from '@/constants/big-number'
import { MULTIPLE_OF_GAS, MAX_GAS_LIMIT } from '@/constants'

import styles from './style'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

const steps = ['Step1: Deposit', 'Get ETHi Ticket', 'Step2: Allocation Action', 'Get ETHi']

export default function Deposit({
  address,
  ethBalance,
  ethDecimals,
  ethiDecimals,
  userProvider,
  VAULT_ABI,
  VAULT_ADDRESS,
  ETH_ADDRESS,
  isBalanceLoading,
  minimumInvestmentAmount
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [ethValue, setEthValue] = useState('')
  const [mintGasLimit, setMintGasLimit] = useState(BigNumber.from('174107'))
  const [gasPriceCurrent, setGasPriceCurrent] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [isOpenEstimateModal, setIsOpenEstimateModal] = useState(false)
  const [estimateVaultBuffValue, setEstimateVaultBuffValue] = useState(BigNumber.from(0))
  const loadingTimer = useRef()

  const nextRebaseTime = getLastPossibleRebaseTime()
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
    const balance = ethBalance
    const decimals = ethDecimals
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
    const maxValue = ethBalance.sub(v)
    setEthValue(
      formatBalance(maxValue.gt(0) ? maxValue : 0, ethDecimals, {
        showAll: true
      })
    )
  }

  const diposit = async () => {
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
    const amount = BigNumber.from(BN(ethValue).multipliedBy(BigNumber.from(10).pow(ethDecimals).toString()).toFixed())
    console.log('nextTokens=', ETH_ADDRESS, amount)
    const signer = userProvider.getSigner()
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const nVaultWithUser = vaultContract.connect(signer)
    let isSuccess = false

    const extendObj = {}
    // if gasLimit times not 1, need estimateGas
    if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
      const gas = await nVaultWithUser.estimateGas.mint(ETH_ADDRESS, amount, 0, { from: address, value: amount })
      const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
      // gasLimit not exceed maximum
      const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
      extendObj.gasLimit = maxGasLimit
    }
    await nVaultWithUser
      .mint(ETH_ADDRESS, amount, 0, {
        ...extendObj,
        from: address,
        value: amount
      })
      .then(tx => tx.wait())
      .then(() => {
        isSuccess = true
      })
      .catch(error => {
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
        } else if (isLessThanMinValue(errorMsg)) {
          tip = `Deposit Amount must be greater than ${toFixed(minimumInvestmentAmount, BN_18, 2)}ETH!`
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
      })

    if (isSuccess) {
      setEthValue('')
    }

    loadingTimer.current = setTimeout(() => {
      setIsLoading(false)
      setIsOpenEstimateModal(false)
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
        setEstimateVaultBuffValue(BigNumber.from(0))
        return
      }
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const amount = BigNumber.from(BN(ethValue).multipliedBy(BigNumber.from(10).pow(ethDecimals).toString()).toFixed())
      const result = await vaultContract.estimateMint(ETH_ADDRESS, amount).catch(error => {
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
        } else if (isLessThanMinValue(errorMsg)) {
          tip = `Deposit Amount must be greater than ${toFixed(minimumInvestmentAmount, BN_18, 2)}ETH!`
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
        return BigNumber.from(0)
      })
      setEstimateVaultBuffValue(result)
    }, 1500)
  )

  /**
   *
   */
  const openEstimateModal = () => {
    setIsOpenEstimateModal(true)
  }

  useEffect(() => {
    estimateMint()
    return () => estimateMint.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    const estimatedUsedValue = BigNumber.from(10).pow(ethDecimals)
    if (isEmpty(userProvider) || isEmpty(VAULT_ADDRESS) || isEmpty(VAULT_ABI) || ethBalance.lt(estimatedUsedValue)) {
      return
    }
    const signer = userProvider.getSigner()
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const nVaultWithUser = vaultContract.connect(signer)
    nVaultWithUser.estimateGas
      .mint(ETH_ADDRESS, estimatedUsedValue, {
        from: address,
        value: estimatedUsedValue
      })
      .then(setMintGasLimit)
      .catch(noop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProvider, VAULT_ADDRESS, ethBalance, VAULT_ABI])

  const isLogin = !isEmpty(userProvider)
  const isValid = isValidValue()

  return (
    <>
      <GridContainer classes={{ root: classes.depositContainer }}>
        <p className={classes.estimateText}>From</p>
        <GridItem xs={12} sm={12} md={12} lg={12} className={classes.tokenInputWrapper}>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <div className={classes.inputLabelWrapper}>
                <div className={classes.tokenInfo}>
                  <img className={classes.tokenLogo} alt="" src={`./images/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619.png`} />
                  <span className={classes.tokenName}>WETH</span>
                </div>
                <CustomTextField
                  classes={{ root: classes.input }}
                  value={ethValue}
                  onChange={handleInputChange}
                  placeholder="deposit amount"
                  maxEndAdornment
                  onMaxClick={handleMaxClick}
                  error={!isUndefined(isValid) && !isValid}
                />
              </div>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <p
                className={classes.estimateText}
                title={formatBalance(ethBalance, ethDecimals, {
                  showAll: true
                })}
              >
                Balance:&nbsp;&nbsp;
                <Loading loading={isBalanceLoading}>{formatBalance(ethBalance, ethDecimals)}</Loading>
              </p>
            </GridItem>
          </GridContainer>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.footerContainer}>
            <Button disabled={!isLogin || (isLogin && !isValid)} color="colorfull" onClick={openEstimateModal} style={{ width: '100%' }}>
              Deposit
            </Button>
          </div>
        </GridItem>
      </GridContainer>
      <Modal className={classes.modal} open={isOpenEstimateModal} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <Paper elevation={3} className={classes.depositModal}>
          <BocStepper
            classes={{
              root: classes.root
            }}
            alternativeLabel
            activeStep={1}
            connector={<BocStepConnector />}
          >
            {map(steps, (i, index) => {
              return (
                <Step key={index}>
                  <BocStepLabel StepIconComponent={BocStepIcon}>{i}</BocStepLabel>
                </Step>
              )
            })}
          </BocStepper>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12} lg={12} className={classes.item}>
              <Typography variant="subtitle1" gutterBottom className={classes.subTitle}>
                Deposit Amounts:&nbsp;
                <span key={address} className={classes.flexText}>
                  <span style={{ color: 'chocolate', marginRight: 5 }}>{ethValue}</span> ETH&nbsp;
                  <img className={classes.ModalTokenLogo} alt="" src={'./images/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png'} />
                </span>
              </Typography>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12} className={classes.item}>
              <Typography variant="subtitle1" gutterBottom className={classes.subTitle}>
                Estimate User Get:&nbsp;
                <span style={{ color: 'darkturquoise' }}>
                  &nbsp; + {toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(ethiDecimals))}
                  &nbsp;
                </span>
                &nbsp; ETHi Tickets
              </Typography>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12} className={classes.item}>
              <Typography variant="subtitle1" gutterBottom className={classes.subTitle}>
                Exchange&nbsp;
                <Tooltip
                  classes={{
                    tooltip: classes.tooltip
                  }}
                  placement="top"
                  title="Estimated amount of ETHi that can be exchanged"
                >
                  <InfoIcon classes={{ root: classes.labelToolTipIcon }} />
                </Tooltip>
                :&nbsp;From&nbsp;
                <span style={{ color: 'chocolate' }}>{toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(ethiDecimals))}</span>
                &nbsp; ETHi Tickets <span style={{ fontWeight: 'bold', color: 'dimgrey' }}>To</span>
                &nbsp;
                <span style={{ color: 'darkturquoise' }}>
                  {toFixed(estimateVaultBuffValue.mul(9987).div(10000), BigNumber.from(10).pow(ethiDecimals), 2)}
                </span>
                &nbsp; ETHi
              </Typography>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12} className={classes.item}>
              <Typography variant="subtitle1" gutterBottom className={classes.subTitle}>
                Exchange Time&nbsp;
                <Tooltip
                  classes={{
                    tooltip: classes.tooltip
                  }}
                  placement="top"
                  title="The latest planned execution date may not be executed due to cost and other factors"
                >
                  <InfoIcon classes={{ root: classes.labelToolTipIcon }} />
                </Tooltip>
                :&nbsp;
                <span style={{ color: 'chocolate' }}>{moment(nextRebaseTime).format('YYYY-MM-DD HH:mm:ss')}</span>
              </Typography>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12} className={classes.item} style={{ textAlign: 'center' }}>
              <Button color="colorfull" onClick={diposit} style={{ width: '50%' }}>
                Continue
              </Button>
              <Button style={{ marginLeft: 20 }} color="danger" onClick={() => setIsOpenEstimateModal(false)}>
                Cancel
              </Button>
            </GridItem>
          </GridContainer>
        </Paper>
      </Modal>
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