import React, { useState, useEffect, useRef, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Utils === //
import * as ethers from 'ethers'
import BN from 'bignumber.js'
import { useDispatch } from 'react-redux'
import isUndefined from 'lodash/isUndefined'
import map from 'lodash/map'
import some from 'lodash/some'
import every from 'lodash/every'
import reduce from 'lodash/reduce'
import debounce from 'lodash/debounce'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import moment from 'moment'
import { getLastPossibleRebaseTime } from '@/helpers/time-util'
import { isAd, isEs, isRp, isDistributing, errorTextOutput, isLessThanMinValue } from '@/helpers/error-handler'

// === Components === //
import Step from '@material-ui/core/Step'
import BocStepper from '@/components/Stepper/Stepper'
import BocStepLabel from '@/components/Stepper/StepLabel'
import BocStepIcon from '@/components/Stepper/StepIcon'
import BocStepConnector from '@/components/Stepper/StepConnector'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import InfoIcon from '@material-ui/icons/Info'

import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import CustomTextField from '@/components/CustomTextField'
import Button from '@/components/CustomButtons/Button'
import { warmDialog } from '@/reducers/meta-reducer'
import { toFixed, formatBalance } from '@/helpers/number-format'
import Loading from '@/components/LoadingComponent'

// === Constants === //
import { USDT_ADDRESS, USDC_ADDRESS, DAI_ADDRESS, IERC20_ABI, MULTIPLE_OF_GAS, MAX_GAS_LIMIT } from '@/constants'
import { BN_18 } from '@/constants/big-number'

// === Styles === //
import styles from './style'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)
const TOKEN = {
  USDT: 'USDT',
  USDC: 'USDC',
  DAI: 'DAI'
}

const steps = ['Step1: Deposit', 'Get USDi Ticket', 'Step2: Allocation Action', 'Get USDi']

export default function Deposit({
  address,
  usdtBalance,
  usdtDecimals,
  usdcBalance,
  usdcDecimals,
  daiBalance,
  daiDecimals,
  usdiDecimals,
  userProvider,
  VAULT_ABI,
  VAULT_ADDRESS,
  vaultBufferBalance,
  vaultBufferDecimals,
  isBalanceLoading,
  minimumInvestmentAmount
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [usdtValue, setUsdtValue] = useState('')
  const [usdcValue, setUsdcValue] = useState('')
  const [daiValue, setDaiValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEstimate, setIsEstimate] = useState(false)
  const [isOpenEstimateModal, setIsOpenEstimateModal] = useState(false)
  const [estimateVaultBuffValue, setEstimateVaultBuffValue] = useState(BigNumber.from(0))
  const loadingTimer = useRef()

  const nextRebaseTime = getLastPossibleRebaseTime()

  const tokenBasicState = {
    [TOKEN.USDT]: {
      value: usdtValue,
      balance: usdtBalance,
      decimals: usdtDecimals
    },
    [TOKEN.USDC]: {
      value: usdcValue,
      balance: usdcBalance,
      decimals: usdcDecimals
    },
    [TOKEN.DAI]: {
      value: daiValue,
      balance: daiBalance,
      decimals: daiDecimals
    }
  }

  const formConfig = [
    {
      name: TOKEN.USDT,
      address: USDT_ADDRESS,
      image: './images/0x55d398326f99059fF775485246999027B3197955.png',
      setValue: setUsdtValue,
      isValid: isValidValue(TOKEN.USDT),
      ...tokenBasicState[TOKEN.USDT]
    },
    {
      name: TOKEN.USDC,
      address: USDC_ADDRESS,
      image: './images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png',
      setValue: setUsdcValue,
      isValid: isValidValue(TOKEN.USDC),
      ...tokenBasicState[TOKEN.USDC]
    },
    {
      name: TOKEN.DAI,
      address: DAI_ADDRESS,
      image: './images/0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3.png',
      setValue: setDaiValue,
      isValid: isValidValue(TOKEN.DAI),
      ...tokenBasicState[TOKEN.DAI]
    }
  ]

  /**
   * check if value is valid
   * @returns
   */
  function isValidValue(token) {
    const { value, balance, decimals } = tokenBasicState[token]
    if (value === '' || value === '-' || value === '0' || isEmpty(value.replace(/ /g, ''))) return
    // not a number
    if (isNaN(Number(value))) return false
    const nextValue = BN(value)
    const nextFromValue = nextValue.multipliedBy(BigNumber.from(10).pow(decimals).toString())
    // should be positive
    if (nextFromValue.lte(0)) return false
    // should be integer
    const nextFromValueString = nextValue.multipliedBy(BigNumber.from(10).pow(decimals).toString())
    if (nextFromValueString.toFixed().indexOf('.') !== -1) return false
    // balance less than value
    if (balance.lt(BigNumber.from(nextFromValue.toFixed()))) return false
    return true
  }

  const handleInputChange = (event, item) => {
    try {
      setIsEstimate(true)
      item.setValue(event.target.value)
    } catch (error) {
      item.setValue('')
    }
  }

  const handleMaxClick = item => {
    item.setValue(formatBalance(item.balance, item.decimals, { showAll: true }))
  }

  const getTokenAndAmonut = () => {
    const isValidUsdtValue = isValidValue(TOKEN.USDT)
    const isValidUsdcValue = isValidValue(TOKEN.USDC)
    const isValidDaiValue = isValidValue(TOKEN.DAI)
    const nextTokens = []
    const nextAmounts = []
    if (isValidUsdtValue) {
      const nextUsdtValue = BigNumber.from(BN(usdtValue).multipliedBy(BigNumber.from(10).pow(usdtDecimals).toString()).toFixed())
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(USDT_ADDRESS)
    }
    if (isValidUsdcValue) {
      const nextUsdtValue = BigNumber.from(BN(usdcValue).multipliedBy(BigNumber.from(10).pow(usdcDecimals).toString()).toFixed())
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(USDC_ADDRESS)
    }
    if (isValidDaiValue) {
      const nextUsdtValue = BigNumber.from(BN(daiValue).multipliedBy(BigNumber.from(10).pow(daiDecimals).toString()).toFixed())
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(DAI_ADDRESS)
    }
    return [nextTokens, nextAmounts]
  }

  const deposit = async () => {
    clearTimeout(loadingTimer.current)
    // step1: valid three tokens
    const isValidUsdtValue = isValidValue(TOKEN.USDT)
    const isValidUsdcValue = isValidValue(TOKEN.USDC)
    const isValidDaiValue = isValidValue(TOKEN.DAI)
    if (!isValidUsdtValue && !isValidUsdcValue && !isValidDaiValue) {
      return dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Please enter the correct value'
        })
      )
    }
    // step2: convert precision, approve three tokens
    setIsLoading(true)
    const [nextTokens, nextAmounts] = getTokenAndAmonut()
    console.log('nextTokens=', nextTokens, nextAmounts)
    const signer = userProvider.getSigner()
    for (const key in nextTokens) {
      const contract = new ethers.Contract(nextTokens[key], IERC20_ABI, userProvider)
      const contractWithUser = contract.connect(signer)
      // get allow amount
      const allowanceAmount = await contractWithUser.allowance(address, VAULT_ADDRESS)
      // If deposit amount greater than allow amount, reset amount
      if (nextAmounts[key].gt(allowanceAmount)) {
        // If allowance equal 0, approve nextAmount, otherwise approve 0 and approve nextAmount
        if (allowanceAmount.gt(0)) {
          console.log('add allowance:', nextAmounts[key].sub(allowanceAmount).toString())
          await contractWithUser
            .increaseAllowance(VAULT_ADDRESS, nextAmounts[key].sub(allowanceAmount))
            .then(tx => tx.wait())
            .catch(e => {
              // cancel by user
              if (e.code === 4001) {
                setIsLoading(false)
                return Promise.reject(e)
              }
              // If increase failed, approve 0 and approve nextAmounts
              return contractWithUser
                .approve(VAULT_ADDRESS, 0)
                .then(tx => tx.wait())
                .then(() => contractWithUser.approve(VAULT_ADDRESS, nextAmounts[key]).then(tx => tx.wait()))
            })
        } else {
          console.log('current allowance:', allowanceAmount.toString(), 'next allowance:', nextAmounts[key].toString())
          await contractWithUser
            .approve(VAULT_ADDRESS, nextAmounts[key])
            .then(tx => tx.wait())
            .catch(e => {
              // cancel by user
              if (e.code === 4001) {
                setIsLoading(false)
                return Promise.reject(e)
              }
            })
        }
      }
    }
    // step3: deposit
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const nVaultWithUser = vaultContract.connect(signer)
    let isSuccess = false
    const extendObj = {}
    // if gasLimit times not 1, need estimateGas
    if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
      const gas = await nVaultWithUser.estimateGas.mint(nextTokens, nextAmounts, 0)
      const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
      // gasLimit not exceed maximum
      const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
      extendObj.gasLimit = maxGasLimit
    }
    await nVaultWithUser
      .mint(nextTokens, nextAmounts, 0, extendObj)
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
          tip = `Deposit Amount must be greater than ${toFixed(minimumInvestmentAmount, BN_18, 2)}USD!`
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
      setUsdtValue('')
      setUsdcValue('')
      setDaiValue('')
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

  /**
   *
   */
  const openEstimateModal = () => {
    setIsOpenEstimateModal(true)
  }

  const estimateMint = useCallback(
    debounce(async () => {
      const isValidUsdtValue = isValidValue(TOKEN.USDT)
      const isValidUsdcValue = isValidValue(TOKEN.USDC)
      const isValidDaiValue = isValidValue(TOKEN.DAI)
      const isFalse = v => v === false
      const [tokens, amounts] = getTokenAndAmonut()
      if (isFalse(isValidUsdtValue) || isFalse(isValidUsdcValue) || isFalse(isValidDaiValue) || tokens.length === 0) {
        setEstimateVaultBuffValue(BigNumber.from(0))
        setIsEstimate(false)
        return
      }
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const result = await vaultContract.estimateMint(tokens, amounts).catch(error => {
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
          tip = `Deposit Amount must be greater than ${toFixed(minimumInvestmentAmount, BN_18, 2)}USD!`
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

  useEffect(() => {
    estimateMint()
    return () => estimateMint.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usdcValue, usdtValue, daiValue])

  const isLogin = !isEmpty(userProvider)

  return (
    <>
      <GridContainer classes={{ root: classes.depositContainer }}>
        <p className={classes.estimateText}>From</p>
        {map(formConfig, item => (
          <GridItem key={item.name} xs={12} sm={12} md={12} lg={12} className={classes.tokenInputWrapper}>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <div className={classes.inputLabelWrapper}>
                  <div className={classes.tokenInfo}>
                    <img className={classes.tokenLogo} alt="" src={item.image} />
                    <span className={classes.tokenName}>{item.name}</span>
                  </div>
                  <CustomTextField
                    classes={{ root: classes.input }}
                    value={item.value}
                    onChange={event => handleInputChange(event, item)}
                    placeholder="deposit amount"
                    maxEndAdornment
                    onMaxClick={() => handleMaxClick(item)}
                    error={!isUndefined(item.isValid) && !item.isValid}
                  />
                </div>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <p
                  className={classes.estimateText}
                  title={formatBalance(item.balance, item.decimals, {
                    showAll: true
                  })}
                >
                  Balance:&nbsp;&nbsp;
                  <Loading loading={isBalanceLoading}>{formatBalance(item.balance, item.decimals)}</Loading>
                </p>
              </GridItem>
            </GridContainer>
          </GridItem>
        ))}
      </GridContainer>
      <GridContainer classes={{ root: classes.estimateContainer }}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText}>To</p>
          <p className={classes.estimateBalanceTitle}>
            USDi Ticket:
            <span className={classes.estimateBalanceNum}>
              <Loading loading={isEstimate}>{toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(usdiDecimals))}</Loading>
            </span>
          </p>
          <p className={classes.estimateText}>
            Balance:&nbsp;&nbsp;
            <span>
              <Loading loading={isBalanceLoading}>{formatBalance(vaultBufferBalance, vaultBufferDecimals)}</Loading>
            </span>
          </p>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.footerContainer}>
            <Button
              disabled={
                !isLogin ||
                (isLogin &&
                  (some(formConfig, item => isValidValue(item.name) === false) || every(formConfig, item => isValidValue(item.name) !== true)))
              }
              color="colorfull"
              onClick={openEstimateModal}
              style={{ width: '100%' }}
            >
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
                {reduce(
                  map(formConfig, item => {
                    const { name, value, image, isValid, address } = item
                    if (!isValid) {
                      return
                    }
                    return (
                      <span key={address} className={classes.flexText}>
                        <span style={{ color: 'chocolate', marginRight: 5 }}>{value}</span> {name}&nbsp;
                        <img className={classes.ModalTokenLogo} alt="" src={image} />
                      </span>
                    )
                  }),
                  (rs, i, index) => {
                    if (isEmpty(i)) {
                      return rs
                    }
                    if (!isEmpty(rs)) {
                      rs.push(<span key={index}> + </span>)
                    }
                    rs.push(i)
                    return rs
                  },
                  []
                )}
              </Typography>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12} className={classes.item}>
              <Typography variant="subtitle1" gutterBottom className={classes.subTitle}>
                Estimate User Get:&nbsp;
                <span style={{ color: 'darkturquoise' }}>
                  &nbsp; + {toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(usdiDecimals))}
                  &nbsp;
                </span>
                &nbsp; USDi Tickets
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
                  title="Estimated amount of USDi that can be exchanged"
                >
                  <InfoIcon classes={{ root: classes.labelToolTipIcon }} />
                </Tooltip>
                :&nbsp;From&nbsp;
                <span style={{ color: 'chocolate' }}>{toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(usdiDecimals))}</span>
                &nbsp; USDi Tickets <span style={{ fontWeight: 'bold', color: 'dimgrey' }}>To</span>
                &nbsp;
                <span style={{ color: 'darkturquoise' }}>
                  <Loading loading={isEstimate}>
                    {toFixed(estimateVaultBuffValue.mul(9987).div(10000), BigNumber.from(10).pow(usdiDecimals), 2)}
                  </Loading>
                </span>
                &nbsp; USDi
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
              <Button color="colorfull" onClick={deposit} style={{ width: '50%' }}>
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