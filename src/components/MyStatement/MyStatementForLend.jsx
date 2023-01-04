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
import { formatBalance } from '@/helpers/number-format'

// === Constants === //
import { USDI_DECIMALS } from '@/constants/usdi'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)

const MyStatementForLend = props => {
  const { balance, supply, day7Apy, day30Apy } = props

  const classes = useStyles()

  const fullBalance = formatBalance(balance, USDI_DECIMALS)
  const balanceFormat = numeral(fullBalance).format('0,0.[0000] a')
  const [balanceText, balanceSymbol] = balanceFormat.split(' ')

  const fullSupply = formatBalance(supply, USDI_DECIMALS)
  const supplyFormat = numeral(fullSupply).format('0,0.[0000] a')
  const [supplyText, supplySymbol] = supplyFormat.split(' ')
  const cardProps = [
    {
      title: 'Balance',
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
      unit: `${balanceSymbol}${balanceSymbol ? ' ' : ''} ETH`
    },
    {
      title: 'Supply',
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
      content: supplyText,
      fullAmount: fullSupply,
      unit: `${supplySymbol}${supplySymbol ? ' ' : ''}`
    },
    {
      title: 'Supply APY',
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
      content: numeral(day7Apy?.apy).format('0,0.00'),
      unit: '%'
    },
    {
      title: 'Borrow APY',
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
      content: numeral(day30Apy?.apy).format('0,0.00'),
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

export default MyStatementForLend
