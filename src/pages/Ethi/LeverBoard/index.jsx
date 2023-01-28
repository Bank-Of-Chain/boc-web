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
import useCreditFacade from '@/hooks/useCreditFacade'

// === Reducers === //
import { warmDialog } from '@/reducers/meta-reducer'

// === Utils === //
import BN from 'bignumber.js'
import * as ethers from 'ethers'
import map from 'lodash/map'
import isEmpty from 'lodash/isEmpty'
import isFunction from 'lodash/isFunction'
import { toFixed } from '@/helpers/number-format'

// === Constants === //
import { WETH_ADDRESS } from '@/constants/tokens'

// === Styles === //
import styles from './style'
import useCreditAccount from '../../../hooks/useCreditAccount'

const { BigNumber } = ethers

const useStyles = makeStyles(styles)

const icon = <InfoIcon style={{ marginLeft: '0.2rem', fontSize: '1rem' }} />

const LeverBoard = props => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider, ETHI_ADDRESS, VAULT_BUFFER_ADDRESS, CREDIT_ADDRESS_ABI, CREDIT_MANAGER_ABI } = props
  const [isDeposit, setIsDeposit] = useState()
  const [lever, setLever] = useState(1)
  const [ethiBalance, setEthiBalance] = useState(BigNumber.from(0))

  const [creditCreateModal, setCreditCreateModal] = useState(false)
  const creditInfo = useCreditFacade(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
  const { decimals: ethiDecimals } = useErc20Token(ETHI_ADDRESS, userProvider)
  const { decimals: wethDecimals } = useErc20Token(WETH_ADDRESS, userProvider)
  const {
    decimals,
    isCreditAddressLoading,
    borrowInterest,
    vaultApy,
    personalApy,
    increaseDebt,
    decreaseDebt,
    redeemCollateral,
    hasOpenedCreditAccount,
    distributePegTokenTick,
    creditManagerAddress,
    queryBaseInfo,
    withdrawFromVault,
    creditAddress,
    getCreditAccountPegTokenAmount
  } = creditInfo

  const { collateralAmount } = useCreditAccount(creditAddress, CREDIT_ADDRESS_ABI, userProvider)

  const [estimateApy, setEstimateApy] = useState(BigNumber.from(0))
  const [balance, setBalance] = useState(BigNumber.from(0))
  const [debtAmount, setDebtAmount] = useState(BigNumber.from(0))
  const [healthRatio, setHealthRatio] = useState(0)

  const calcCurrentLeverRadio = useCallback(() => {
    if (balance.eq(0) || collateralAmount.eq(0)) {
      return 0
    }
    const calcDecimals = BigNumber.from(10).pow(wethDecimals)
    const currentLeverRadio = toFixed(balance.mul(BigNumber.from(10).pow(wethDecimals)).div(collateralAmount), calcDecimals, 2)
    return 1 * currentLeverRadio
  }, [collateralAmount, balance, wethDecimals])

  const updateLever = useCallback(() => {
    const currentLeverRadio = calcCurrentLeverRadio()

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
    const callFunc = isIncrease ? withdrawFromVault : increaseDebt
    const leverDecimals = BigNumber.from(10).pow(4)
    const newLever = BigNumber.from(BN(lever).multipliedBy(leverDecimals.toString()).toString())
    const nextValue = balance.mul(leverDecimals).sub(balance.sub(debtAmount).mul(newLever)).div(leverDecimals).abs()
    console.log('nextValue=', nextValue.toString())
    callFunc(nextValue)
  }, [lever, increaseDebt, decreaseDebt, calcCurrentLeverRadio, debtAmount, balance])

  const leverageRadioValue = calcCurrentLeverRadio()

  const calcEstimateApy = useCallback(() => {
    const nextEstimateApy = (vaultApy / calcCurrentLeverRadio()) * lever
    setEstimateApy(nextEstimateApy)
  }, [lever, calcCurrentLeverRadio])

  useEffect(calcEstimateApy, [calcEstimateApy])

  useEffect(() => {
    if (isEmpty(creditAddress)) return
    if (!isFunction(queryBaseInfo)) return
    queryBaseInfo(creditAddress).then(v => {
      const { hf, _borrowAmountWithInterestAndFees, _total } = v
      setBalance(_total)
      setHealthRatio(hf)
      setDebtAmount(_borrowAmountWithInterestAndFees)
    })
  }, [creditAddress, queryBaseInfo])

  useEffect(() => {
    setLever(leverageRadioValue)
  }, [leverageRadioValue])

  useEffect(() => {
    if (isEmpty(creditAddress)) return
    if (!isFunction(getCreditAccountPegTokenAmount)) return
    getCreditAccountPegTokenAmount(creditAddress).then(setEthiBalance)
  }, [creditAddress, getCreditAccountPegTokenAmount])

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
        <span onClick={() => distributePegTokenTick([creditAddress])}>
          Balance
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
      content: `${toFixed(balance, BigNumber.from(10).pow(ethiDecimals), 6)} WETH`
    },
    {
      title: (
        <span onClick={() => redeemCollateral([])}>
          Collateral
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`the mortgage amounts.`}
          >
            {icon}
          </Tooltip>
        </span>
      ),
      content: `${toFixed(collateralAmount, BigNumber.from(10).pow(ethiDecimals), 6)} WETH`
    },
    {
      title: (
        <span onClick={() => decreaseDebt([])}>
          Debts
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="top"
            title={`the debts amounts.`}
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
      content: borrowInterest.toString()
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
    },
    {
      title: '',
      content: (
        <Button color="colorful-border" size="sm" onClick={() => setIsDeposit(true)}>
          Increase Collateral
        </Button>
      )
    },
    {
      title: '',
      content: (
        <Button color="colorful-border" size="sm" onClick={() => setIsDeposit(false)}>
          Decrease Collateral
        </Button>
      )
    }
  ]

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
          content={
            <GridContainer>
              {map(data, (i, index) => (
                <GridItem key={index} xs={6} sm={6} md={6}>
                  {i.title && <span>{i.title}:&nbsp;&nbsp;</span>}
                  <span>{i.content}</span>
                </GridItem>
              ))}
            </GridContainer>
          }
          title="Base Info"
        />
      </GridItem>
      <GridItem xs={9} sm={9} md={9}>
        <CardV2
          title="Leverage update"
          content={
            <GridContainer>
              {map(resetData, (i, index) => (
                <GridItem key={index} xs={6} sm={6} md={6}>
                  {i.title && <span>{i.title}:&nbsp;&nbsp;</span>}
                  <span>{i.content}</span>
                </GridItem>
              ))}
              <GridItem xs={12} sm={12} md={12} style={{ marginTop: '2rem' }}>
                <Slider
                  defaultValue={leverageRadioValue}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  step={0.01}
                  onChange={(e, v) => setLever(v)}
                  min={1}
                  max={5}
                  marks={[
                    {
                      value: 1,
                      label: '1'
                    },
                    {
                      value: 2,
                      label: '2'
                    },
                    {
                      value: 3,
                      label: '3'
                    },
                    {
                      value: 4,
                      label: '4'
                    },
                    {
                      value: 5,
                      label: '5'
                    }
                  ]}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Button
                  color="colorful-border"
                  size="sm"
                  onClick={() => {
                    if (ethiBalance.gt(0)) {
                      updateLever()
                    }
                  }}
                >
                  <Tooltip
                    classes={{
                      tooltip: classes.tooltip
                    }}
                    placement="top"
                    title={'Sufficient ethi is required for leverage adjustment'}
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
