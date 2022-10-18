import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Card from '@/components/Card'
import { LineEchart } from '@/components/Echarts'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import Tooltip from '@material-ui/core/Tooltip'

// === Services === //
import getLineEchartOpt from '@/components/Echarts/options/line/getLineEchartOpt'

// === Hooks === //
import usePersonalData from '@/hooks/usePersonalData'

// === Utils === //
import numeral from 'numeral'
import map from 'lodash/map'
import { toFixed } from '@/helpers/number-format'

// === Constants === //
import { ETHI_BN_DECIMALS, ETHI_DISPLAY_DECIMALS } from '@/constants/ethi'
import { TOKEN_DISPLAY_DECIMALS } from '@/constants/vault'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)

const MyStatement1 = props => {
  const { address, type, chain } = props

  const isUSDi = type === 'USDi'
  const classes = useStyles()
  const [optionForLineChart, setOptionForLineChart] = useState({})
  const { dataSource, loading: chartLoading } = usePersonalData(chain, type, address, type)

  useEffect(() => {
    const tvls = [
      {
        date: '2022-10-11',
        balance: '1'
      },
      {
        date: '2022-10-12',
        balance: '10'
      },
      {
        date: '2022-10-13',
        balance: '10'
      },
      {
        date: '2022-10-14',
        balance: '20'
      },
      {
        date: '2022-10-15',
        balance: '20'
      },
      {
        date: '2022-10-16',
        balance: '20'
      },
      {
        date: '2022-10-17',
        balance: '30'
      }
    ]
    const option1 = getLineEchartOpt(tvls, 'balance', dataSource.token, {
      format: 'MM-DD',
      xAxis: {
        axisTick: {
          alignWithLabel: true
        }
      }
    })
    console.log('option1=', option1)
    setOptionForLineChart(option1)
  }, [dataSource, address])

  const cardProps = [
    {
      title: 'Net Deposit',
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title={'Total profits from BoC that are withdrawable and cumulative.'}
        >
          <InfoIcon style={{ fontSize: '1.375rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: numeral(toFixed('41231231231224141414', ETHI_BN_DECIMALS, isUSDi ? TOKEN_DISPLAY_DECIMALS : ETHI_DISPLAY_DECIMALS)).format(
        isUSDi ? '0,0.[00]' : '0,0.[0000]'
      ),
      unit: 'WETH'
    },
    {
      title: 'Current Value',
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title={'Yield over the past week.'}
        >
          <InfoIcon style={{ fontSize: '1.375rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: numeral(toFixed('55231231231224141414', ETHI_BN_DECIMALS, isUSDi ? TOKEN_DISPLAY_DECIMALS : ETHI_DISPLAY_DECIMALS)).format(
        isUSDi ? '0,0.[00]' : '0,0.[0000]'
      ),
      isAPY: true,
      unit: 'WETH'
    },
    {
      title: 'IRR',
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title={'Yield over the past month.'}
        >
          <InfoIcon style={{ fontSize: '1.375rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: numeral('6.21').format('0,0.00'),
      isAPY: true,
      unit: '%'
    }
  ]

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12} lg={12}>
        <GridContainer>
          {map(cardProps, (i, index) => {
            return (
              <GridItem key={index} xs={12} sm={12} md={4} lg={4}>
                <Card {...i} />
              </GridItem>
            )
          })}
        </GridContainer>
        <GridContainer className={classes.lineChart}>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <Card
              loading={chartLoading}
              title={
                <span>
                  AAVE Outstanding Loan
                  <Tooltip title={`Curve of daily change in the total ${isUSDi ? 'USDi' : 'ETHi'} held by the user.`}>
                    <InfoIcon style={{ marginLeft: 8, fontSize: '1rem' }} />
                  </Tooltip>
                </span>
              }
              loadingOption={{
                width: '100%',
                height: '2rem'
              }}
            >
              <LineEchart option={optionForLineChart} style={{ minHeight: '20rem' }} />
            </Card>
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.lineChart}>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <Card
              loading={chartLoading}
              title={
                <span>
                  AAVE Collateral
                  <Tooltip title={`Curve of daily change in the total ${isUSDi ? 'USDi' : 'ETHi'} held by the user.`}>
                    <InfoIcon style={{ marginLeft: 8, fontSize: '1rem' }} />
                  </Tooltip>
                </span>
              }
              loadingOption={{
                width: '100%',
                height: '2rem'
              }}
            >
              <LineEchart option={optionForLineChart} style={{ minHeight: '20rem' }} />
            </Card>
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.lineChart}>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <Card
              loading={chartLoading}
              title={
                <span>
                  AAVE Health Ratio
                  <Tooltip title={`Curve of daily change in the total ${isUSDi ? 'USDi' : 'ETHi'} held by the user.`}>
                    <InfoIcon style={{ marginLeft: 8, fontSize: '1rem' }} />
                  </Tooltip>
                </span>
              }
              loadingOption={{
                width: '100%',
                height: '2rem'
              }}
            >
              <LineEchart option={optionForLineChart} style={{ minHeight: '20rem' }} />
            </Card>
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.lineChart}>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <Card
              loading={chartLoading}
              title={
                <span>
                  Uniswap Position Value
                  <Tooltip title={`Curve of daily change in the total ${isUSDi ? 'USDi' : 'ETHi'} held by the user.`}>
                    <InfoIcon style={{ marginLeft: 8, fontSize: '1rem' }} />
                  </Tooltip>
                </span>
              }
              loadingOption={{
                width: '100%',
                height: '2rem'
              }}
            >
              <LineEchart option={optionForLineChart} style={{ minHeight: '20rem' }} />
            </Card>
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.lineChart}>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <Card
              loading={chartLoading}
              title={
                <span>
                  Unrealized Profit
                  <Tooltip title={`Curve of daily change in the total ${isUSDi ? 'USDi' : 'ETHi'} held by the user.`}>
                    <InfoIcon style={{ marginLeft: 8, fontSize: '1rem' }} />
                  </Tooltip>
                </span>
              }
              loadingOption={{
                width: '100%',
                height: '2rem'
              }}
            >
              <LineEchart option={optionForLineChart} style={{ minHeight: '20rem' }} />
            </Card>
          </GridItem>
        </GridContainer>
      </GridItem>
    </GridContainer>
  )
}

export default MyStatement1
