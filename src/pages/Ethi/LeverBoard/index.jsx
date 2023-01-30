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

// === Hooks === //
import useErc20Token from '@/hooks/useErc20Token'
import useUserAddress from '@/hooks/useUserAddress'
import usePoolService from '@/hooks/usePoolService'
import useCreditFacade from '@/hooks/useCreditFacade'

// === Reducers === //
import { warmDialog } from '@/reducers/meta-reducer'

// === Utils === //
import moment from 'moment'
import BN from 'bignumber.js'
import * as ethers from 'ethers'
import map from 'lodash/map'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
import isFunction from 'lodash/isFunction'
import { toFixed } from '@/helpers/number-format'
import { getLastPossibleRebaseTime } from '@/helpers/time-util'
import { errorTextOutput, isIncreaseDebtForbiddenException, isBorrowAmountOutOfLimitsException } from '@/helpers/error-handler'

// === Constants === //
import { WETH_ADDRESS } from '@/constants/tokens'
import WithdrawFromVault from '@/constants/leverage'

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
  const [lever, setLever] = useState(1)
  const [ethiBalance, setEthiBalance] = useState(BigNumber.from(0))
  const [creditAccountEthiBalance, setCreditAccountEthiBalance] = useState(BigNumber.from(0))
  const [vaultBufferBalance, setVaultBufferBalance] = useState(BigNumber.from(0))

  const [creditCreateModal, setCreditCreateModal] = useState(false)
  const creditInfo = useCreditFacade(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
  const { decimals: vaultBufferDecimals, balanceOf: vaultBufferBalanceOf } = useErc20Token(VAULT_BUFFER_ADDRESS, userProvider)
  const { decimals: ethiDecimals, balanceOf: ethiBalanceOf } = useErc20Token(ETHI_ADDRESS, userProvider)
  const { decimals: wethDecimals } = useErc20Token(WETH_ADDRESS, userProvider)

  const {
    decimals,
    isCreditAddressLoading,
    vaultApy,
    personalApy,
    increaseDebt,
    decreaseDebt,
    redeemCollateral,
    hasOpenedCreditAccount,
    distributePegTokenTicket,
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

  const [estimateApy, setEstimateApy] = useState(BigNumber.from(0))
  const [balance, setBalance] = useState(BigNumber.from(0))
  const [debtAmount, setDebtAmount] = useState(BigNumber.from(0))
  const [healthRatio, setHealthRatio] = useState(0)

  const nextRebaseTime = getLastPossibleRebaseTime()
  const address = useUserAddress(userProvider)

  /**
   *
   */
  const calcCurrentLeverRadio = useCallback(() => {
    if (balance.eq(0) || collateralAmount.eq(0)) {
      return 0
    }
    const calcDecimals = BigNumber.from(10).pow(wethDecimals)
    const currentLeverRadio = toFixed(balance.mul(BigNumber.from(10).pow(wethDecimals)).div(collateralAmount), calcDecimals, 2)
    return 1 * currentLeverRadio
  }, [collateralAmount.toString(), balance, wethDecimals])

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
    const callFunc = isIncrease ? v => withdrawFromVault(v, WithdrawFromVault.DECREASE_LEVERAGE) : increaseDebt
    const leverDecimals = BigNumber.from(10).pow(4)
    const newLever = BigNumber.from(BN(lever).multipliedBy(leverDecimals.toString()).toString())
    const nextValue = balance.mul(leverDecimals).sub(balance.sub(debtAmount).mul(newLever)).div(leverDecimals).abs()
    callFunc(nextValue).catch(error => {
      const errorMsg = errorTextOutput(error)
      let tip = ''
      if (isIncreaseDebtForbiddenException(errorMsg)) {
        tip = 'In case of emergency, do not raise the leverage factor!'
      } else if (isBorrowAmountOutOfLimitsException(errorMsg)) {
        tip = 'The amount borrowed must be less than 100 ETH!'
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
  }, [lever, increaseDebt, decreaseDebt, calcCurrentLeverRadio, debtAmount, balance])

  const leverageRadioValue = calcCurrentLeverRadio()

  /**
   * calculate future apy base on personal apy and leverage radio
   */
  const calcEstimateApy = useCallback(() => {
    const leverRatioValue = calcCurrentLeverRadio()
    if (leverRatioValue === 0) {
      setEstimateApy(0)
      return
    }
    const nextEstimateApy = (personalApy / leverRatioValue) * lever
    setEstimateApy(nextEstimateApy)
  }, [lever, personalApy, calcCurrentLeverRadio])

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
    setLever(leverageRadioValue)
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

  /**
   * query the ETHi balance in the CreditAccount before distributing.
   */
  const queryEthiBalanceOfInCreditAddress = useCallback(() => {
    if (isEmpty(creditAddress)) return
    ethiBalanceOf(creditAddress).then(setEthiBalance)
  }, [creditAddress, ethiBalanceOf])

  useEffect(queryVaultBufferBalanceOfInCreditAddress, [queryVaultBufferBalanceOfInCreditAddress])
  useEffect(queryEthiBalanceOfInCreditAddress, [queryEthiBalanceOfInCreditAddress])
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

  useEffect(() => {
    const listener = () => {
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider) || isEmpty(address)) return
      const vaultContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      vaultContract.on('AddCollateral', handleAddCollateral)
      vaultContract.on('RedeemCollateral', handleRedeemCollateral)
      vaultContract.on('WithdrawFromVault', handleWithdrawFromVault)
      return () => {
        vaultContract.off('AddCollateral', handleAddCollateral)
        vaultContract.off('RedeemCollateral', handleRedeemCollateral)
        vaultContract.off('WithdrawFromVault', handleWithdrawFromVault)
      }
    }
    return listener()
  }, [address, CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider, handleAddCollateral])

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
        <Modal className={classes.modal} open={creditCreateModal} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
          <Paper elevation={3} className={classes.depositModal}>
            <CreditCreate
              CREDIT_FACADE_ADDRESS={CREDIT_FACADE_ADDRESS}
              CREDIT_FACADE_ABI={CREDIT_FACADE_ABI}
              userProvider={userProvider}
              onCancel={() => setCreditCreateModal(false)}
            />
          </Paper>
        </Modal>
      </GridItem>
    )
  }

  const data = [
    {
      title: (
        <span onClick={() => distributePegTokenTicket([creditAddress])}>
          Balance
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`distributePegTokenTicket([creditAddress])`}
          >
            {icon}
          </Tooltip>
        </span>
      ),
      content: `${toFixed(creditAccountEthiBalance, BigNumber.from(10).pow(ethiDecimals), 6)} ETHi`
    },
    {
      title: (
        <span>
          Distribute
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`ETHi in CreditAccount waiting for keeper distribute`}
          >
            {icon}
          </Tooltip>
        </span>
      ),
      content: (
        <>
          {toFixed(ethiBalance, BigNumber.from(10).pow(ethiDecimals), 6)} ETHi
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`${toFixed(
              vaultBufferBalance,
              BigNumber.from(10).pow(vaultBufferDecimals),
              6
            )} ETHi ticket functions as parallel ETHi that will be converted into ETHi after fund allocations have been successful. Last execution
                    time was ${moment(nextRebaseTime).format('yyyy-MM-DD HH:mm')}`}
          >
            {icon}
          </Tooltip>
        </>
      )
    },
    {
      title: (
        <span onClick={() => redeemCollateral(address, [])}>
          Collateral
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`redeemCollateral([])`}
          >
            {icon}
          </Tooltip>
        </span>
      ),
      content: `${toFixed(collateralAmount, BigNumber.from(10).pow(ethiDecimals), 6)} WETH`
    },
    {
      title: (
        <span onClick={() => decreaseDebt(address, [])}>
          Debts
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`decreaseDebt([])`}
          >
            {icon}
          </Tooltip>
        </span>
      ),
      content: `${toFixed(debtAmount, BigNumber.from(10).pow(ethiDecimals), 6)} WETH`
    },
    {
      title: (
        <span>
          Health Ratio
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`ETHi in Credit account.`}
          >
            {icon}
          </Tooltip>
        </span>
      ),
      content: toFixed(healthRatio, 10000)
    },
    {
      title: (
        <span>
          Leverage Ratio
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`ETHi in Credit account.`}
          >
            {icon}
          </Tooltip>
        </span>
      ),
      content: leverageRadioValue.toFixed(4)
    },
    {
      title: (
        <span>
          Borrow Interest
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`ETHi in Credit account.`}
          >
            {icon}
          </Tooltip>
        </span>
      ),
      content: `${borrowApy}%`
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
            title={`ETHi in Credit account.`}
          >
            {icon}
          </Tooltip>
        </span>
      ),
      content: `${vaultApy / 100}%`
    },
    {
      title: (
        <span>
          Personal APY
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`ETHi in Credit account.`}
          >
            {icon}
          </Tooltip>
        </span>
      ),
      content: `${personalApy / 100}%`
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
      <Button color="colorful-border" size="sm" onClick={() => setIsDeposit(true)}>
        Increase Collateral
      </Button>
    )
  })

  data.push({
    title: '',
    content: (
      <Button color="colorful-border" size="sm" onClick={() => setIsDeposit(false)}>
        Decrease Collateral
      </Button>
    )
  })

  const resetData = [
    {
      title: 'The next leverage ratio',
      content: `${lever.toString()}`
    },
    {
      title: 'Estimate APY',
      content: `${(estimateApy / 100).toFixed(4)}%`
    }
  ]

  return (
    <GridContainer spacing={2}>
      <GridItem xs={9} sm={9} md={9}>
        <CardV2
          title={<span className={classes.content}>Base Info</span>}
          content={
            <GridContainer>
              {map(data, (i, index) => (
                <GridItem key={index} xs={6} sm={6} md={6}>
                  {i.title && <span className={classes.title}>{i.title}:&nbsp;&nbsp;</span>}
                  <span className={classes.content}>{i.content}</span>
                </GridItem>
              ))}
              {!isEmpty(waitingForSwap) && (
                <GridItem xs={12} sm={12} md={12}>
                  <span className={classes.warning}>
                    <p style={{ textAlign: 'center', fontWeight: '800' }}>Warning</p>
                    Funds in the CreditAccount are being redeemed...
                  </span>
                </GridItem>
              )}
              {ethiBalance.gt(0) && (
                <GridItem xs={12} sm={12} md={12}>
                  <span className={classes.warning}>
                    <p style={{ textAlign: 'center', fontWeight: '800' }}>Warning</p>
                    Waiting for the keeper to allocate the ETHi!
                  </span>
                </GridItem>
              )}
            </GridContainer>
          }
        />
      </GridItem>
      <GridItem xs={9} sm={9} md={9}>
        <CardV2
          title={<span className={classes.content}>Leverage update</span>}
          content={
            <GridContainer>
              {map(resetData, (i, index) => (
                <GridItem key={index} xs={6} sm={6} md={6}>
                  {i.title && <span className={classes.title}>{i.title}:&nbsp;&nbsp;</span>}
                  <span className={classes.content}>{i.content}</span>
                </GridItem>
              ))}
              <GridItem xs={12} sm={12} md={12} style={{ marginTop: '1rem' }}>
                <Slider
                  defaultValue={leverageRadioValue}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  step={0.1}
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
                <Button color="colorful-border" size="sm" onClick={updateLever}>
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
      <Modal className={classes.modal} open={isDeposit === true} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <Paper elevation={3} className={classes.depositModal}>
          <LeverDeposit
            CREDIT_FACADE_ADDRESS={CREDIT_FACADE_ADDRESS}
            CREDIT_FACADE_ABI={CREDIT_FACADE_ABI}
            leverageRadioValue={leverageRadioValue}
            userProvider={userProvider}
            onCancel={() => setIsDeposit()}
          />
        </Paper>
      </Modal>
      <Modal className={classes.modal} open={isDeposit === false} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
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
      </Modal>
    </GridContainer>
  )
}

export default LeverBoard
