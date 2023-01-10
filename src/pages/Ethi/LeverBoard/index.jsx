/* eslint-disable */
import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Slider from '@material-ui/core/Slider'
import Button from '@/components/CustomButtons/Button'
import LeverDeposit from './../LeverDeposit'
import LeverWithdraw from './../LeverWithdraw'
import CardV2 from '@/components/Card/CardV2'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import InfoIcon from '@material-ui/icons/Info'

// === Hooks === //
import useCredit from '@/hooks/useCredit'

// === Utils === //
import isEmpty from 'lodash/isEmpty'

// === Styles === //
import styles from './style'
import { map } from 'lodash'

const useStyles = makeStyles(styles)

const icon = <InfoIcon style={{ marginLeft: '0.2rem', fontSize: '1rem' }} />

const LeverBoard = props => {
  const classes = useStyles()
  const { CREDIT_POOL_ADDRESS, CREDIT_POOL_ABI, userProvider } = props
  const [isDeposit, setIsDeposit] = useState()
  const { balance, mortgageAmount, creditAddress, debtAmount, healthRatio, leverRatio, borrowInterest, vaultApy, personalApy } = useCredit(
    CREDIT_POOL_ADDRESS,
    CREDIT_POOL_ABI,
    userProvider
  )

  if (isEmpty(creditAddress)) {
    return (
      <GridItem xs={9} sm={9} md={9}>
        <div className={classes.notConnect}>
          <div>We have not credit account!</div>
          <div className={classes.textBottom}>
            <Button color="colorful-border" size="lg">
              Going to create a credit account
            </Button>
          </div>
        </div>
      </GridItem>
    )
  }

  const data = [
    {
      title: (
        <span>
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
      content: balance.toString()
    },
    {
      title: (
        <span>
          Mortgage
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
      content: mortgageAmount.toString()
    },
    {
      title: (
        <span>
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
      content: debtAmount.toString()
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
      content: `${healthRatio.toString()}%`
    },
    {
      title: (
        <span>
          Lever Ratio
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
      content: leverRatio
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
      title: '',
      content: (
        <Button color="colorful-border" size="sm" onClick={() => setIsDeposit(true)}>
          Add Assets
        </Button>
      )
    },
    {
      title: '',
      content: (
        <Button color="colorful-border" size="sm" onClick={() => setIsDeposit(false)}>
          Withdraw
        </Button>
      )
    }
  ]

  const resetData = [
    {
      title: '调节后的杠杆率',
      content: balance.toString()
    },
    {
      title: '预期APY',
      content: `${balance.toString()}%`
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
                  {i.title && <span>{i.title}:</span>}
                  <span>{i.content}</span>
                </GridItem>
              ))}
            </GridContainer>
          }
          title="BaseInfo"
        />
      </GridItem>
      <GridItem xs={9} sm={9} md={9}>
        <CardV2
          title="调节杠杆率"
          content={
            <GridContainer>
              {map(resetData, (i, index) => (
                <GridItem key={index} xs={6} sm={6} md={6}>
                  {i.title && <span>{i.title}:</span>}
                  <span>{i.content}</span>
                </GridItem>
              ))}
              <GridItem xs={12} sm={12} md={12}>
                <Slider
                  defaultValue={1}
                  getAriaValueText={v => v}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  step={0.5}
                  marks
                  min={0}
                  max={3}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Button color="colorful-border" size="sm">
                  Setting
                </Button>
              </GridItem>
            </GridContainer>
          }
        ></CardV2>
      </GridItem>
      <Modal className={classes.modal} open={isDeposit === true} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <Paper elevation={3} className={classes.depositModal}>
          <LeverDeposit onCancel={() => setIsDeposit()} />
        </Paper>
      </Modal>
      <Modal className={classes.modal} open={isDeposit === false} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <Paper elevation={3} className={classes.depositModal}>
          <LeverWithdraw onCancel={() => setIsDeposit()} />
        </Paper>
      </Modal>
    </GridContainer>
  )
}

export default LeverBoard
