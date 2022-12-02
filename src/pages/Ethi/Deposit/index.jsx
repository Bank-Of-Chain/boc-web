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
import numeral from 'numeral'

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
import InfoIcon from '@material-ui/icons/InfoOutlined'
import Loading from '@/components/LoadingComponent'
import Card from '@/components/Card'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import CustomTextField from '@/components/CustomTextField'
import Button from '@/components/CustomButtons/Button'

// === Utils === //
import noop from 'lodash/noop'
import { getLastPossibleRebaseTime } from '@/helpers/time-util'
import { isAd, isEs, isRp, isDistributing, errorTextOutput, isLessThanMinValue } from '@/helpers/error-handler'
import { BN_18 } from '@/constants/big-number'
import { MULTIPLE_OF_GAS, MAX_GAS_LIMIT } from '@/constants'
import { warmDialog } from '@/reducers/meta-reducer'
import { toFixed, formatBalance } from '@/helpers/number-format'

import { getPegTokenDetail } from '@/services/subgraph-service'
import { getAPY } from '@/services/api-service'

import styles from './style'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

const steps = [
  <>
    <div>Step1:</div>
    <div>Deposit</div>
  </>,
  'Get ETHi Ticket',
  <>
    <div>Step2:</div>
    <div>Allocation</div>
  </>,
  'Get ETHi'
]

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
  const [isEstimate, setIsEstimate] = useState(false)
  const [isOpenEstimateModal, setIsOpenEstimateModal] = useState(false)
  const [estimateVaultBuffValue, setEstimateVaultBuffValue] = useState(BigNumber.from(0))
  const loadingTimer = useRef()

  const nextRebaseTime = getLastPossibleRebaseTime()
  const decimal = BigNumber.from(10).pow(ethiDecimals)
  const [tvl, setTvl] = useState('-')
  const [tvlSymbol, setTvlSymbol] = useState('')
  const [apy, setApy] = useState('-')

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
    const maxValue = ethBalance.sub(v)
    const maxBalance = formatBalance(maxValue.gt(0) ? maxValue : 0, ethDecimals, {
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
        setIsEstimate(false)
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
      setIsEstimate(false)
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
  }, [userProvider, VAULT_ADDRESS, ethBalance, VAULT_ABI])

  useEffect(() => {
    getPegTokenDetail('ETHi', VAULT_ADDRESS).then(data => {
      const { totalAssets } = data.vault
      const tvlFormat = toFixed(totalAssets, BN_18, 2)
      const tvlWithSymbol = numeral(tvlFormat).format('0.00 a')
      const [tvl, tvlSymbol] = tvlWithSymbol.split(' ')
      setTvl(tvl)
      setTvlSymbol(tvlSymbol)
    })
    getAPY({ tokenType: 'ETHi' }).then(data => {
      const apy = isNaN(data) ? '-' : Number(data)
      setApy(apy.toFixed(2))
    })
  }, [])

  const isLogin = !isEmpty(userProvider)
  const isValid = isValidValue()

  return (
    <>
      <GridContainer spacing={3}>
        <GridItem xs={12} sm={12} md={6} lg={6}>
          <Card
            title="TVL"
            content={tvl}
            unit={`${tvlSymbol}${tvlSymbol ? ' ' : ''}ETH`}
            tip={
              <Tooltip
                classes={{
                  tooltip: classes.tooltip
                }}
                placement="right"
                title="Total Value Locked."
              >
                <InfoIcon style={{ fontSize: '1rem', color: '#888888' }} />
              </Tooltip>
            }
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={6} lg={6}>
          <Card
            title="APY (Last 30 days)"
            content={apy}
            unit="%"
            tip={
              <Tooltip
                classes={{
                  tooltip: classes.tooltip
                }}
                placement="right"
                title="Yield over the past month."
              >
                <InfoIcon style={{ fontSize: '1rem', color: '#888888' }} />
              </Tooltip>
            }
          />
        </GridItem>
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
                          <img className={classes.tokenLogo} alt="" src={`./images/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png`} />
                          <span className={classes.tokenName}>ETH</span>
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
                      title={formatBalance(ethBalance, ethDecimals, {
                        showAll: true
                      })}
                    >
                      Balance:&nbsp;&nbsp;
                      <Loading loading={isBalanceLoading}>{formatBalance(ethBalance, ethDecimals)}</Loading>
                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
            </GridContainer>
            <GridContainer classes={{ root: classes.estimateContainer }}>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <p className={classes.estimateText}>To</p>
                <div className={classes.estimateBalanceTitle}>
                  ETHi Ticket
                  <Tooltip
                    classes={{
                      tooltip: classes.tooltip
                    }}
                    placement="right"
                    title={`ETHi Ticket functions as parallel ETHi that will be converted into ETHi after fund allocations have been successful. Last
            execution time was ${moment(nextRebaseTime).format('yyyy-MM-DD HH:mm')}`}
                  >
                    <InfoIcon style={{ fontSize: '1.25rem', marginLeft: 8, color: '#888' }} />
                  </Tooltip>
                  <span className={classes.estimateBalanceNum}>
                    <Loading loading={isEstimate}>{toFixed(estimateVaultBuffValue, decimal)}</Loading>
                  </span>
                </div>
                <p className={classes.estimateText}>Estimated Gas Fee: {toFixed(getGasFee(), BigNumber.from(10).pow(ethDecimals), 6)} ETH</p>
              </GridItem>
              {isEmpty(VAULT_ADDRESS) && (
                <GridItem xs={12} sm={12} md={12} lg={12}>
                  <p style={{ textAlign: 'center', color: 'red' }}>Switch to the ETH chain firstly!</p>
                </GridItem>
              )}
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <div className={classes.footerContainer}>
                  <Button
                    disabled={!isLogin || (isLogin && !isValid)}
                    color="colorful"
                    onClick={openEstimateModal}
                    className={classes.blockButton}
                    fullWidth={true}
                  >
                    Deposit
                  </Button>
                </div>
              </GridItem>
            </GridContainer>
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
          <div className={classes.item}>
            <div className={classes.title}>Deposit Amounts:</div>
            <div className={classes.tokens}>
              <div className={classes.token}>
                <img className={classes.ModalTokenLogo} alt="" src="/images/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png" />
                <span className={classes.name}>ETH: </span>
                <span className={classes.name}>{ethValue}</span>
              </div>
            </div>
          </div>
          <div className={classes.itemBottom}>
            <div className={classes.exchangeInfo}>
              Receive:
              <span className={classes.usdiInfo}>{toFixed(estimateVaultBuffValue, decimal, 2)}</span>ETHi Tickets
            </div>
          </div>
          <div className={classes.buttonGroup}>
            <Button className={classes.cancelButton} color="danger" onClick={() => setIsOpenEstimateModal(false)}>
              Cancel
            </Button>
            <Button className={classes.okButton} color="colorful" onClick={deposit}>
              Continue
            </Button>
          </div>
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
