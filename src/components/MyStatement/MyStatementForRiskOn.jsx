import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Card from '@/components/Card'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import Tooltip from '@material-ui/core/Tooltip'

// === Utils === //
import numeral from 'numeral'
import map from 'lodash/map'
import { toFixed, formatBalance } from '@/helpers/number-format'

// === Constants === //
import { ETHI_BN_DECIMALS, ETHI_DISPLAY_DECIMALS } from '@/constants/ethi'
import { USDI_DECIMALS } from '@/constants/usdi'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)

const MyStatementForRiskOn = props => {
  const { balance, mortgageAmount, personalApy, debtAmount, healthRatio, leverRatio, borrowInterest, vaultApy } = props

  const classes = useStyles()

  const fullBalance = formatBalance(balance, USDI_DECIMALS)
  const balanceFormat = numeral(fullBalance).format('0,0.[0000] a')
  const [balanceText, balanceSymbol] = balanceFormat.split(' ')
  const cardProps = [
    {
      title: '信用账户拥有多少ETHi',
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title="Current available balance on your account"
        >
          <InfoIcon style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: balanceText,
      fullAmount: fullBalance,
      unit: `${balanceSymbol}${balanceSymbol ? ' ' : ''} ETHi`
    },
    {
      title: `抵押物数量`,
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title={'Total profits from BoC that are withdrawable and cumulative.'}
        >
          <InfoIcon style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: numeral(toFixed(mortgageAmount, ETHI_BN_DECIMALS, ETHI_DISPLAY_DECIMALS)).format('0,0.[0000]'),
      unit: 'ETH'
    },
    {
      title: `债务数量`,
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title={'Total profits from BoC that are withdrawable and cumulative.'}
        >
          <InfoIcon style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: numeral(toFixed(debtAmount, ETHI_BN_DECIMALS, ETHI_DISPLAY_DECIMALS)).format('0,0.[0000]'),
      unit: 'ETH'
    },
    {
      title: `健康度`,
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title={'Total profits from BoC that are withdrawable and cumulative.'}
        >
          <InfoIcon style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: numeral(healthRatio).format('0,0.00'),
      unit: ''
    },
    {
      title: `杠杆系数`,
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title={'Total profits from BoC that are withdrawable and cumulative.'}
        >
          <InfoIcon style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: numeral(leverRatio).format('0,0.00'),
      unit: ''
    },
    {
      title: 'Borrow Interest',
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title={'Yield over the past week.'}
        >
          <InfoIcon style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: numeral(borrowInterest).format('0,0.00'),
      unit: '%'
    },
    {
      title: 'VAULT APY',
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title={'Yield over the past month.'}
        >
          <InfoIcon style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: numeral(vaultApy).format('0,0.00'),
      unit: '%'
    },
    {
      title: '信用账户的个人APY',
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title={'Yield over the past month.'}
        >
          <InfoIcon style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: numeral(personalApy).format('0,0.00'),
      unit: '%'
    }
  ]

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12} lg={12}>
        <GridContainer spacing={3}>
          {map(cardProps, (i, index) => {
            return (
              <GridItem key={index} xs={12} sm={12} md={6} lg={6}>
                <Card {...i} />
              </GridItem>
            )
          })}
        </GridContainer>
      </GridItem>
    </GridContainer>
  )
}

export default MyStatementForRiskOn
