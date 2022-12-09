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
import debounce from 'lodash/debounce'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import compact from 'lodash/compact'
import filter from 'lodash/filter'
import moment from 'moment'
import numeral from 'numeral'
import { getLastPossibleRebaseTime } from '@/helpers/time-util'
import { isAd, isEs, isRp, isDistributing, errorTextOutput, isLessThanMinValue } from '@/helpers/error-handler'

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
import Card from '@/components/Card'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import CustomTextField from '@/components/CustomTextField'
import Button from '@/components/CustomButtons/Button'
import { warmDialog } from '@/reducers/meta-reducer'
import { toFixed, formatBalance } from '@/helpers/number-format'
import Loading from '@/components/LoadingComponent'
import SimpleSelect from '@/components/SimpleSelect/SimpleSelectV2'
import AddIcon from '@material-ui/icons/Add'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ClearIcon from '@material-ui/icons/Clear'

// === Constants === //
import { USDT_ADDRESS, USDC_ADDRESS, DAI_ADDRESS, IERC20_ABI, MULTIPLE_OF_GAS, MAX_GAS_LIMIT } from '@/constants'
import { BN_18 } from '@/constants/big-number'

import { getPegTokenDetail } from '@/services/subgraph-service'
import { getAPY } from '@/services/api-service'

// === Styles === //
import styles from './style'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)
const TOKEN = {
  USDT: 'USDT',
  USDC: 'USDC',
  DAI: 'DAI'
}

const steps = [
  <>
    <div>Step1:</div>
    <div>Deposit</div>
  </>,
  'Get USDi Ticket',
  <>
    <div>Step2:</div>
    <div>Allocation</div>
  </>,
  'Get USDi'
]

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
  const decimal = BigNumber.from(10).pow(usdiDecimals)
  const [tokenSelect, setTokenSelect] = useState([USDT_ADDRESS, USDC_ADDRESS, DAI_ADDRESS])
  const [tvl, setTvl] = useState('-')
  const [fullTvl, setFullTvl] = useState('')
  const [tvlSymbol, setTvlSymbol] = useState('')
  const [apy, setApy] = useState('-')

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
    const { balance, decimals, value } = item
    const maxValue = formatBalance(balance, decimals, { showAll: true })
    if (maxValue === value) {
      return
    }
    setIsEstimate(true)
    item.setValue(maxValue)
  }

  const getTokenAndAmonut = () => {
    const isValidUsdtValue = isValidValue(TOKEN.USDT)
    const isValidUsdcValue = isValidValue(TOKEN.USDC)
    const isValidDaiValue = isValidValue(TOKEN.DAI)
    const nextTokens = []
    const nextAmounts = []
    if (tokenSelect.includes(USDT_ADDRESS) && isValidUsdtValue) {
      const nextUsdtValue = BigNumber.from(BN(usdtValue).multipliedBy(BigNumber.from(10).pow(usdtDecimals).toString()).toFixed())
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(USDT_ADDRESS)
    }
    if (tokenSelect.includes(USDC_ADDRESS) && isValidUsdcValue) {
      const nextUsdtValue = BigNumber.from(BN(usdcValue).multipliedBy(BigNumber.from(10).pow(usdcDecimals).toString()).toFixed())
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(USDC_ADDRESS)
    }
    if (tokenSelect.includes(DAI_ADDRESS) && isValidDaiValue) {
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
    if (
      (tokenSelect.includes(USDT_ADDRESS) && isValidUsdtValue === false) ||
      (tokenSelect.includes(USDC_ADDRESS) && isValidUsdcValue === false) ||
      (tokenSelect.includes(DAI_ADDRESS) && isValidDaiValue === false)
    ) {
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

  const addSelectToken = address => {
    if (!tokenSelect.includes(address)) {
      setTokenSelect([...tokenSelect, address])
    }
  }

  const removeSelectToken = address => {
    if (tokenSelect.includes(address)) {
      setTokenSelect(filter(tokenSelect, i => i !== address))
    }
  }

  const estimateMint = useCallback(
    debounce(async () => {
      const isValidUsdtValue = isValidValue(TOKEN.USDT)
      const isValidUsdcValue = isValidValue(TOKEN.USDC)
      const isValidDaiValue = isValidValue(TOKEN.DAI)
      const isFalse = v => v === false
      const [tokens, amounts] = getTokenAndAmonut()
      if (
        (tokenSelect.includes(USDT_ADDRESS) && isFalse(isValidUsdtValue)) ||
        (tokenSelect.includes(USDC_ADDRESS) && isFalse(isValidUsdcValue)) ||
        (tokenSelect.includes(DAI_ADDRESS) && isFalse(isValidDaiValue)) ||
        tokens.length === 0
      ) {
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
  }, [usdcValue, usdtValue, daiValue])

  useEffect(() => {
    getPegTokenDetail('USDi', VAULT_ADDRESS).then(data => {
      const { totalAssets } = data.vault
      const tvlFormat = toFixed(totalAssets, BN_18, 2)
      const tvlWithSymbol = numeral(tvlFormat).format('0.00 a')
      const [tvl, tvlSymbol] = tvlWithSymbol.split(' ')
      setTvl(tvl)
      setFullTvl(tvlFormat)
      setTvlSymbol(tvlSymbol)
    })
    getAPY({ tokenType: 'USDi' }).then(data => {
      const apy = isNaN(data) ? '-' : Number(data)
      setApy(apy.toFixed(2))
    })
  }, [])

  const isLogin = !isEmpty(userProvider)

  return (
    <>
      <GridContainer spacing={3}>
        <GridItem xs={12} sm={12} md={6} lg={6}>
          <Card
            title="TVL"
            content={tvl}
            fullAmount={fullTvl}
            unit={`${tvlSymbol}${tvlSymbol ? ' ' : ''}USD`}
            tip={
              <Tooltip
                classes={{
                  tooltip: classes.tooltip
                }}
                placement="right"
                title="Total Value Locked."
              >
                <InfoIcon style={{ fontSize: '1.125rem', color: '#888888' }} />
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
                <InfoIcon style={{ fontSize: '1.125rem', color: '#888888' }} />
              </Tooltip>
            }
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.wrapper}>
            <GridContainer classes={{ root: classes.depositContainer }}>
              <p className={classes.estimateText}>From</p>
              {map(formConfig, item => {
                if (tokenSelect.includes(item.address)) {
                  const addItem = compact(
                    map(formConfig, selectItem => {
                      if (!tokenSelect.includes(selectItem.address)) {
                        return {
                          label: selectItem.name,
                          value: selectItem.address,
                          img: `./images/${selectItem.address}.png`,
                          endDont: <AddIcon />
                        }
                      }
                    })
                  )
                  const selectOptions = [
                    {
                      key: 'expand',
                      label: item.name,
                      value: 'expand',
                      img: `./images/${item.address}.png`,
                      endDont: <ExpandLessIcon />
                    },
                    ...addItem
                  ]
                  if (tokenSelect.length > 1) {
                    selectOptions.push({
                      key: 'clear',
                      label: item.name,
                      value: 'clear',
                      img: `./images/${item.address}.png`,
                      endDont: <ClearIcon />
                    })
                  }
                  return (
                    <GridItem key={item.name} xs={12} sm={12} md={12} lg={12} className={classes.tokenInputWrapper}>
                      <GridContainer justify="center" spacing={2}>
                        <GridItem xs={4} sm={4} md={4} lg={4}>
                          <SimpleSelect
                            options={selectOptions}
                            value={'expand'}
                            onChange={v => {
                              if (v === 'expand') return
                              if (v === 'clear') {
                                removeSelectToken(item.address)
                                item.setValue('')
                                return
                              }
                              addSelectToken(v)
                            }}
                          />
                        </GridItem>
                        <GridItem xs={8} sm={8} md={8} lg={8}>
                          <CustomTextField
                            classes={{ root: classes.input }}
                            value={item.value}
                            onChange={event => handleInputChange(event, item)}
                            placeholder="deposit amount"
                            maxEndAdornment
                            onMaxClick={() => handleMaxClick(item)}
                            error={!isUndefined(item.isValid) && !item.isValid}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12} lg={12}>
                          <div
                            className={classes.balance}
                            title={formatBalance(item.balance, item.decimals, {
                              showAll: true
                            })}
                          >
                            Balance:&nbsp;&nbsp;
                            <Loading loading={isBalanceLoading}>{formatBalance(item.balance, item.decimals)}</Loading>
                          </div>
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                  )
                }
              })}
            </GridContainer>
            <GridContainer classes={{ root: classes.estimateContainer }}>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <p className={classes.estimateText}>To</p>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <div className={classes.estimateBalanceTitle}>
                  USDi Ticket
                  {/* <Tooltip
                    classes={{
                      tooltip: classes.tooltip
                    }}
                    placement="right"
                    title={`USDi Ticket functions as parallel USDi that will be converted into USDi after fund allocations have been successful. Last
            execution time was ${moment(nextRebaseTime).format('yyyy-MM-DD HH:mm')}`}
                  >
                    <InfoIcon style={{ fontSize: '1.25rem', marginLeft: 8, color: '#888' }} />
                  </Tooltip> */}
                  <span className={classes.estimateBalanceNum}>
                    <Loading loading={isEstimate}>{toFixed(estimateVaultBuffValue, decimal)}</Loading>
                  </span>
                </div>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <div className={classes.tip}>
                  USDi Ticket functions as parallel USDi that will be converted into USDi after fund allocations have been successful. Last execution
                  time was {moment(nextRebaseTime).format('yyyy-MM-DD HH:mm')}
                </div>
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
              {map(formConfig, item => {
                const { name, value, image, isValid, address } = item
                if (!isValid) {
                  return
                }
                return (
                  <div className={classes.token} key={address}>
                    <img className={classes.ModalTokenLogo} alt="" src={image} />
                    <span className={classes.name}>{name}: </span>
                    <span className={classes.name}>{Number(value).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className={classes.itemBottom}>
            <div className={classes.exchangeInfo}>
              Receive:
              <span className={classes.usdiInfo}>{toFixed(estimateVaultBuffValue, decimal, 2)}</span>USDi Tickets
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
