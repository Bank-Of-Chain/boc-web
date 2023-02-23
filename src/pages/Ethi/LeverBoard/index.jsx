import React, { useState, useCallback, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useDispatch } from 'react-redux'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Button from '@/components/CustomButtons/Button'
import LeverDeposit from './../LeverDeposit'
import LeverWithdraw from './../LeverWithdraw'
import CreditCreate from './../CreditCreate'
import CardV2 from '@/components/Card/CardV2'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import InfoIcon from '@material-ui/icons/Info'
import Loading from '@/components/LoadingComponent'
import Slider from '@/components/Slider'
import Fade from '@material-ui/core/Fade'
import Description from '@/components/CardDescription/Description'
import DescriptionColume from '@/components/CardDescription/DescriptionColume'
import IconArray from '@/components/IconArray'

// === Hooks === //
import { useAsync } from 'react-async-hook'
import useErc20Token from '@/hooks/useErc20Token'
import useUserAddress from '@/hooks/useUserAddress'
import usePoolService from '@/hooks/usePoolService'
import useCreditFacade from '@/hooks/useCreditFacade'

// === Reducers === //
import { warmDialog } from '@/reducers/meta-reducer'

// === Services === //
import { getAccountApyByAddress, getValutAPYList } from '@/services/api-service'
import { removeFromVaultSuccess } from '@/services/keeper-service'

// === Utils === //
import moment from 'moment'
import numeral from 'numeral'
import BN from 'bignumber.js'
import * as ethers from 'ethers'
import map from 'lodash/map'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
import isFunction from 'lodash/isFunction'
import { toFixed } from '@/helpers/number-format'
import { getLastPossibleRebaseTime } from '@/helpers/time-util'
import {
  errorTextOutput,
  isIncreaseDebtForbiddenException,
  isBorrowAmountOutOfLimitsException,
  isCantWithdrawException
} from '@/helpers/error-handler'

// === Constants === //
import { WETH_ADDRESS } from '@/constants/tokens'
import WithdrawFromVault from '@/constants/leverage'
import { APY_DURATION } from '@/constants/apy-duration'

// === Styles === //
import styles from './style'
import useCreditAccount from '../../../hooks/useCreditAccount'

const { BigNumber } = ethers

const useStyles = makeStyles(styles)

const icon = <InfoIcon style={{ marginLeft: '0.2rem', fontSize: '1rem' }} />

const LeverBoard = props => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const {
    CREDIT_FACADE_ADDRESS,
    CREDIT_FACADE_ABI,
    userProvider,
    ETHI_ADDRESS,
    VAULT_BUFFER_ADDRESS,
    CREDIT_ADDRESS_ABI,
    CREDIT_MANAGER_ABI,
    POOL_SERVICE_ABI
  } = props

  const [isDeposit, setIsDeposit] = useState()
  const [lever, setLever] = useState(2)
  const [creditAccountEthiBalance, setCreditAccountEthiBalance] = useState(BigNumber.from(0))
  const [vaultBufferBalance, setVaultBufferBalance] = useState(BigNumber.from(0))

  const [creditCreateModal, setCreditCreateModal] = useState(false)
  const creditInfo = useCreditFacade(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
  const { decimals: vaultBufferDecimals, balanceOf: vaultBufferBalanceOf } = useErc20Token(VAULT_BUFFER_ADDRESS, userProvider)
  const { decimals: ethiDecimals } = useErc20Token(ETHI_ADDRESS, userProvider)
  const { decimals: wethDecimals } = useErc20Token(WETH_ADDRESS, userProvider)

  const {
    decimals,
    isCreditAddressLoading,
    increaseDebt,
    hasOpenedCreditAccount,
    creditManagerAddress,
    queryBaseInfo,
    withdrawFromVault,
    creditAddress,
    getCreditAccountPegTokenAmount,
    poolAddress
  } = creditInfo

  const { collateralAmount, getCollateralAmount, waitingForSwap, getWaitingForSwap } = useCreditAccount(
    creditAddress,
    CREDIT_ADDRESS_ABI,
    userProvider
  )
  const { borrowApy } = usePoolService(poolAddress, POOL_SERVICE_ABI, userProvider)

  const [estimateApy, setEstimateApy] = useState(0)
  const [balance, setBalance] = useState(BigNumber.from(0))
  const [debtAmount, setDebtAmount] = useState(BigNumber.from(0))
  const [healthRatio, setHealthRatio] = useState(0)

  const nextRebaseTime = getLastPossibleRebaseTime()
  const address = useUserAddress(userProvider)

  /**
   * personal apy fetching
   */
  const personalApyData = useAsync(() => {
    if (isEmpty(creditAddress)) return
    const date = moment().subtract(1, 'days').utc(0).format('yyyy-MM-DD')
    return getAccountApyByAddress(creditAddress, date, {
      chainId: 1,
      tokenType: 'ETHi',
      duration: APY_DURATION.weekly
    }).then(v => get(v, 'apy', '0'))
  }, [creditAddress])

  /**
   * vault apy fetching
   */
  const vaultApyData = useAsync(() => {
    return getValutAPYList({
      chainId: 1,
      duration: APY_DURATION.weekly,
      limit: 1,
      tokenType: 'ETHi'
    }).then(v => get(v, 'data.content.[0].apy', '0'))
  }, [])

  /**
   *
   */
  const calcCurrentLeverRadio = useCallback(() => {
    if (balance.eq(0) || collateralAmount.eq(0)) {
      return 0
    }
    const calcDecimals = BigNumber.from(10).pow(wethDecimals)
    const currentLeverRadio = toFixed(balance.mul(BigNumber.from(10).pow(wethDecimals)).div(balance.sub(debtAmount)), calcDecimals, wethDecimals)
    return 1 * currentLeverRadio
  }, [collateralAmount, wethDecimals, debtAmount, balance])

  /**
   *
   */
  const updateLever = useCallback(() => {
    const currentLeverRadio = calcCurrentLeverRadio()

    if (creditAccountEthiBalance.lte(0)) {
      return dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Sufficient ETHi is required for leverage adjustment!'
        })
      )
    }
    if (currentLeverRadio === lever) {
      return dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Please set the correct leverage value'
        })
      )
    }
    // lever 当前设置的杠杆率
    const isIncrease = currentLeverRadio > lever
    const callFunc = isIncrease ? v => withdrawFromVault(v, creditAccountEthiBalance, WithdrawFromVault.DECREASE_LEVERAGE) : increaseDebt
    const leverDecimals = BigNumber.from(10).pow(18)
    const newLever = BigNumber.from(BN(lever).multipliedBy(leverDecimals.toString()).toString())
    const nextValue = balance.mul(leverDecimals).sub(balance.sub(debtAmount).mul(newLever)).div(leverDecimals).abs()
    callFunc(nextValue)
      .then(tx => tx.wait())
      .then(() => {
        if (isIncrease) {
          removeFromVaultSuccess(address, WithdrawFromVault.DECREASE_LEVERAGE)
        }
      })
      .catch(error => {
        const errorMsg = errorTextOutput(error)
        let tip = ''
        if (isIncreaseDebtForbiddenException(errorMsg)) {
          tip = 'In case of emergency, do not raise the leverage factor!'
        } else if (isBorrowAmountOutOfLimitsException(errorMsg)) {
          tip = 'The amount borrowed must be less than 100 ETH!'
        } else if (isCantWithdrawException(errorMsg)) {
          tip = "You can't change leverage into this value!"
        } else {
          tip = errorMsg
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
      })
  }, [lever, increaseDebt, calcCurrentLeverRadio, debtAmount, balance, creditAccountEthiBalance, withdrawFromVault, dispatch, address])

  const leverageRadioValue = calcCurrentLeverRadio()

  /**
   * calculate future apy base on personal apy and leverage radio
   */
  const calcEstimateApy = useCallback(() => {
    if (personalApyData.loading) return
    const leverRatioValue = calcCurrentLeverRadio()
    if (leverRatioValue === 0 || isEmpty(personalApyData.result)) {
      setEstimateApy(0)
      return
    }
    const personalApy = 1 * personalApyData.result
    const nextEstimateApy = ((personalApy - borrowApy) / leverRatioValue) * lever + borrowApy
    setEstimateApy(nextEstimateApy)
  }, [lever, personalApyData, calcCurrentLeverRadio, borrowApy])

  useEffect(calcEstimateApy, [calcEstimateApy])

  /**
   *
   */
  const queryBaseInfoCall = useCallback(() => {
    if (isEmpty(creditAddress)) return
    if (!isFunction(queryBaseInfo)) return
    queryBaseInfo(creditAddress).then(v => {
      const { _hf, _borrowAmountWithInterestAndFees, _total } = v
      setBalance(_total)
      setHealthRatio(_hf)
      setDebtAmount(_borrowAmountWithInterestAndFees)
    })
  }, [creditAddress, queryBaseInfo])

  useEffect(queryBaseInfoCall, [queryBaseInfoCall])

  useEffect(() => {
    if (leverageRadioValue < 2) {
      setLever(2)
    } else if (leverageRadioValue > 4) {
      setLever(4)
    } else {
      setLever(leverageRadioValue)
    }
  }, [leverageRadioValue])

  /**
   * query the ETHi after distributing.
   */
  const queryCreditAccountPegTokenAmount = useCallback(() => {
    if (isEmpty(creditAddress)) return
    if (!isFunction(getCreditAccountPegTokenAmount)) return
    getCreditAccountPegTokenAmount(creditAddress).then(setCreditAccountEthiBalance)
  }, [creditAddress, getCreditAccountPegTokenAmount])

  /**
   * query the ETHi Ticket in the CreditAccount before BoC dohardwork.
   */
  const queryVaultBufferBalanceOfInCreditAddress = useCallback(() => {
    if (isEmpty(creditAddress)) return
    vaultBufferBalanceOf(creditAddress).then(setVaultBufferBalance)
  }, [creditAddress, vaultBufferBalanceOf])

  useEffect(queryVaultBufferBalanceOfInCreditAddress, [queryVaultBufferBalanceOfInCreditAddress])
  useEffect(queryCreditAccountPegTokenAmount, [queryCreditAccountPegTokenAmount])

  /**
   * event handler
   */
  const handleAddCollateral = useCallback(
    sender => {
      if (sender === address) {
        getCollateralAmount()
        queryBaseInfoCall()
        queryVaultBufferBalanceOfInCreditAddress()
      }
    },
    [address, getCollateralAmount, queryBaseInfoCall, queryVaultBufferBalanceOfInCreditAddress]
  )

  /**
   * event handler
   */
  const handleWithdrawFromVault = useCallback(
    sender => {
      if (sender === address) {
        getWaitingForSwap()
        queryCreditAccountPegTokenAmount()
      }
    },
    [address, getWaitingForSwap, queryCreditAccountPegTokenAmount]
  )

  /**
   * event handler
   */
  const handleRedeemCollateral = useCallback(
    sender => {
      if (sender === address) {
        getCollateralAmount()
        queryBaseInfoCall()
        getWaitingForSwap()
      }
    },
    [address, getCollateralAmount, queryBaseInfoCall, getWaitingForSwap]
  )

  /**
   * event handler
   */
  const handleIncreaseBorrowedAmount = useCallback(
    sender => {
      if (sender === address) {
        queryBaseInfoCall()
        queryVaultBufferBalanceOfInCreditAddress()
      }
    },
    [address, queryBaseInfoCall, queryVaultBufferBalanceOfInCreditAddress]
  )

  /**
   * event handler
   */
  const handleDecreaseBorrowedAmount = useCallback(
    sender => {
      if (sender === address) {
        queryBaseInfoCall()
        queryVaultBufferBalanceOfInCreditAddress()
      }
    },
    [address, queryBaseInfoCall, queryVaultBufferBalanceOfInCreditAddress]
  )

  /**
   * event handler
   */
  const handleDistributePegTokenTicket = useCallback(() => {
    queryCreditAccountPegTokenAmount()
    queryVaultBufferBalanceOfInCreditAddress()
  }, [queryCreditAccountPegTokenAmount, queryVaultBufferBalanceOfInCreditAddress])

  useEffect(() => {
    const listener = () => {
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider) || isEmpty(address)) return
      const vaultContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      vaultContract.on('AddCollateral', handleAddCollateral)
      vaultContract.on('RedeemCollateral', handleRedeemCollateral)
      vaultContract.on('WithdrawFromVault', handleWithdrawFromVault)
      vaultContract.on('IncreaseBorrowedAmount', handleIncreaseBorrowedAmount)
      vaultContract.on('DecreaseBorrowedAmount', handleDecreaseBorrowedAmount)
      vaultContract.on('DistributePegTokenTicket', handleDistributePegTokenTicket)
      return () => {
        vaultContract.off('AddCollateral', handleAddCollateral)
        vaultContract.off('RedeemCollateral', handleRedeemCollateral)
        vaultContract.off('WithdrawFromVault', handleWithdrawFromVault)
        vaultContract.off('IncreaseBorrowedAmount', handleIncreaseBorrowedAmount)
        vaultContract.off('DecreaseBorrowedAmount', handleDecreaseBorrowedAmount)
        vaultContract.off('DistributePegTokenTicket', handleDistributePegTokenTicket)
      }
    }
    return listener()
  }, [
    address,
    CREDIT_FACADE_ADDRESS,
    CREDIT_FACADE_ABI,
    userProvider,
    handleAddCollateral,
    handleRedeemCollateral,
    handleWithdrawFromVault,
    handleIncreaseBorrowedAmount,
    handleDistributePegTokenTicket,
    handleDecreaseBorrowedAmount
  ])

  const debounceSetLever = useCallback(debounce(setLever, 25, { maxWait: 50 }), [])

  if (!hasOpenedCreditAccount || isCreditAddressLoading !== false) {
    return (
      <GridItem xs={9} sm={9} md={9}>
        <div className={classes.notConnect}>
          <Loading loading={isCreditAddressLoading !== false} className={classes.reloadIcon}>
            <div>We have not credit account!</div>
            <div className={classes.textBottom}>
              <Button color="colorful-border" size="lg" onClick={() => setCreditCreateModal(true)}>
                Going to create a credit account
              </Button>
            </div>
          </Loading>
        </div>
        <Modal
          className={classes.modal}
          open={creditCreateModal}
          onClose={() => setCreditCreateModal(false)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <Fade in={creditCreateModal}>
            <Paper elevation={3} className={classes.depositModal}>
              <CreditCreate
                CREDIT_FACADE_ADDRESS={CREDIT_FACADE_ADDRESS}
                CREDIT_FACADE_ABI={CREDIT_FACADE_ABI}
                userProvider={userProvider}
                onCancel={() => setCreditCreateModal(false)}
              />
            </Paper>
          </Fade>
        </Modal>
      </GridItem>
    )
  }

  const data = [
    {
      title: (
        <>
          <span>Balance</span>
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`The ETHi balance for the CreditAccount`}
          >
            {icon}
          </Tooltip>
        </>
      ),
      content: `${toFixed(creditAccountEthiBalance, BigNumber.from(10).pow(ethiDecimals), 4)} ETHi`
    },
    {
      title: (
        <>
          <span>ETHi Tickets</span>
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`ETHi ticket functions as parallel ETHi that will be converted into ETHi after fund allocations have been successful. Last execution
            time was ${moment(nextRebaseTime).format('yyyy-MM-DD HH:mm')}`}
          >
            {icon}
          </Tooltip>
        </>
      ),
      content: <span>{toFixed(vaultBufferBalance, BigNumber.from(10).pow(vaultBufferDecimals), 4)} Tickets</span>
    },
    {
      title: (
        <>
          <span>Collateral</span>
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`The assets that users deposit in`}
          >
            {icon}
          </Tooltip>
        </>
      ),
      content: `${toFixed(collateralAmount, BigNumber.from(10).pow(ethiDecimals), 4)} WETH`
    },
    {
      title: (
        <>
          <span>Debts</span>
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`the borrow amounts about the CreditAccount`}
          >
            {icon}
          </Tooltip>
        </>
      ),
      content: `${toFixed(debtAmount, BigNumber.from(10).pow(ethiDecimals), 4)} WETH`
    },
    {
      title: (
        <>
          <span>Health Ratio</span>
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`the Health Ratio about the CreditAccount.`}
          >
            {icon}
          </Tooltip>
        </>
      ),
      content: toFixed(healthRatio, 10000)
    },
    {
      title: (
        <>
          <span>Leverage Ratio</span>
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`the Leverage Ratio about Collateral and Debts in the CreditAccount`}
          >
            {icon}
          </Tooltip>
        </>
      ),
      content: leverageRadioValue.toFixed(4)
    },
    {
      title: (
        <>
          <span>Borrow Interest</span>
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`Interest at the time of borrowing`}
          >
            {icon}
          </Tooltip>
        </>
      ),
      content: <span className={classes.apyText}>{borrowApy}%</span>
    },
    {
      title: (
        <span>
          Vault APY
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`the BoC apy in last 7 days`}
          >
            {icon}
          </Tooltip>
        </span>
      ),
      content: (
        <Loading loading={vaultApyData.loading} className={classes.reloadIcon}>
          <span className={classes.apyText}>{numeral(vaultApyData.result).format('0,0.[00]')}%</span>
        </Loading>
      )
    },
    {
      title: (
        <>
          <span>Personal APY</span>
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`the personal apy in last 7 days`}
          >
            {icon}
          </Tooltip>
        </>
      ),
      content: (
        <Loading loading={personalApyData.loading} className={classes.reloadIcon}>
          <span className={classes.apyText}>{numeral(personalApyData.result).format('0,0.[00]')}%</span>
        </Loading>
      )
    }
  ]

  // if data array length is odd number, add a empty block has better display
  if (data.length % 2 === 1) {
    data.push({
      title: '',
      content: ''
    })
  }

  data.push({
    title: '',
    content: (
      <Button color="colorful-border" onClick={() => setIsDeposit(true)}>
        Increase Collateral
      </Button>
    )
  })

  data.push({
    title: '',
    content: (
      <Button color="colorful-border" onClick={() => setIsDeposit(false)}>
        Decrease Collateral
      </Button>
    )
  })

  const resetData = [
    {
      title: 'The next leverage ratio',
      content: <span className={classes.apyText}>{lever.toFixed(4)}</span>
    },
    {
      title: 'Estimate APY',
      content: <span className={classes.apyText}>{numeral(estimateApy).format('0,0.[00]')}%</span>
    }
  ]

  console.log('waitingForSwap=', waitingForSwap)

  return (
    <GridContainer spacing={2}>
      <GridItem xs={9} sm={9} md={9}>
        <CardV2
          content={
            <GridContainer>
              <DescriptionColume col={2}>
                {map(data, (i, index) => (
                  <Description key={index} title={i.title} content={i.content}></Description>
                ))}
              </DescriptionColume>
            </GridContainer>
          }
        />
      </GridItem>
      <GridItem xs={9} sm={9} md={9}>
        <CardV2
          content={
            <GridContainer>
              <DescriptionColume col={2}>
                {map(resetData, (i, index) => (
                  <Description key={index} title={i.title} content={i.content} horizontal></Description>
                ))}
              </DescriptionColume>
              <GridItem xs={12} sm={12} md={12} style={{ marginTop: '2rem' }}>
                <Slider
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  step={0.1}
                  value={lever}
                  onChange={(e, v) => debounceSetLever(v)}
                  min={2}
                  max={4}
                  marks={[
                    {
                      value: 2,
                      label: '2'
                    },
                    {
                      value: 2.5,
                      label: '2.5'
                    },
                    {
                      value: 3,
                      label: '3'
                    },
                    {
                      value: 3.5,
                      label: '3.5'
                    },
                    {
                      value: 4,
                      label: '4'
                    }
                  ]}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Button color="colorful-border" onClick={updateLever}>
                  <Tooltip
                    classes={{
                      tooltip: classes.tooltip
                    }}
                    placement="top"
                    title={'Sufficient ETHi is required for leverage adjustment'}
                  >
                    {icon}
                  </Tooltip>
                  Setting
                </Button>
              </GridItem>
            </GridContainer>
          }
        ></CardV2>
      </GridItem>
      <Modal
        className={classes.modal}
        open={isDeposit === true}
        onClose={() => setIsDeposit()}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Fade in={isDeposit === true}>
          <Paper elevation={3} className={classes.depositModal}>
            <LeverDeposit
              CREDIT_FACADE_ADDRESS={CREDIT_FACADE_ADDRESS}
              CREDIT_FACADE_ABI={CREDIT_FACADE_ABI}
              leverageRadioValue={leverageRadioValue}
              userProvider={userProvider}
              onCancel={() => setIsDeposit()}
            />
          </Paper>
        </Fade>
      </Modal>
      <Modal
        className={classes.modal}
        open={isDeposit === false}
        onClose={() => setIsDeposit()}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Fade in={isDeposit === false}>
          <Paper elevation={3} className={classes.depositModal}>
            <LeverWithdraw
              balance={balance}
              decimals={decimals}
              creditManagerAddress={creditManagerAddress}
              CREDIT_MANAGER_ABI={CREDIT_MANAGER_ABI}
              ETHI_ADDRESS={ETHI_ADDRESS}
              CREDIT_ADDRESS_ABI={CREDIT_ADDRESS_ABI}
              VAULT_BUFFER_ADDRESS={VAULT_BUFFER_ADDRESS}
              CREDIT_FACADE_ADDRESS={CREDIT_FACADE_ADDRESS}
              CREDIT_FACADE_ABI={CREDIT_FACADE_ABI}
              userProvider={userProvider}
              onCancel={() => setIsDeposit()}
            />
          </Paper>
        </Fade>
      </Modal>
      <Modal
        className={classes.modal}
        open={!isEmpty(waitingForSwap)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Fade in={!isEmpty(waitingForSwap)}>
          <Paper elevation={3} className={classes.depositModal}>
            <p style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px', color: '#b955d9' }}>Warning!</p>
            <span className={classes.warning}>
              There are <IconArray array={map(waitingForSwap, 'address')} style={{ display: 'inline-block', margin: '0 0.25rem' }} /> Coins, Waiting
              for the keeper to swapping&nbsp;&nbsp;<Loading loading></Loading>
            </span>
            <div className={classes.swapBody}>
              <ol className={classes.olItem}>
                {map(waitingForSwap, (i, index) => (
                  <li className={classes.liItem} key={index}>
                    <div className={classes.liTitle}>
                      <IconArray array={[i.address]} />
                      &nbsp;&nbsp;
                      {i.symbol}
                    </div>
                    <div className={classes.value}>{toFixed(i.amounts, BigNumber.from(10).pow(i.decimals), 2)}</div>
                  </li>
                ))}
              </ol>
            </div>
          </Paper>
        </Fade>
      </Modal>
    </GridContainer>
  )
}

export default LeverBoard
