import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Card from '@/components/Card'
import { LineEchart } from '@/components/Echarts'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import Tooltip from '@material-ui/core/Tooltip'
import OnBuilding from '@/components/OnBuilding'

// === Services === //
import getLineEchartOpt from '@/components/Echarts/options/line/getLineEchartOpt'
import { getDataByType } from '@/services/api-service'

// === Hooks === //
import usePersonalData from '@/hooks/usePersonalData'
import useVaultOnRisk from '@/hooks/useVaultOnRisk'
import { useAsync } from 'react-async-hook'

// === Utils === //
import numeral from 'numeral'
import map from 'lodash/map'
import { toFixed } from '@/helpers/number-format'
import * as ethers from 'ethers'

// === Constants === //
import { ETHI_DISPLAY_DECIMALS } from '@/constants/ethi'
import { TOKEN_DISPLAY_DECIMALS } from '@/constants/vault'
import { CHAIN_ID } from '@/constants'

// === Styles === //
import styles from './style'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

const MyStatementForRiskOn = props => {
  const {
    address,
    type,
    chain,
    userProvider,
    wantTokenSymbol,
    VAULT_FACTORY_ADDRESS,
    VAULT_FACTORY_ABI,
    personalVaultAddress,
    UNISWAPV3_RISK_ON_VAULT,
    UNISWAPV3_RISK_ON_HELPER
  } = props

  const isUSDi = type === 'USDi'
  const classes = useStyles()
  const [optionForLineChart, setOptionForLineChart] = useState({})

  // api datas fetching
  const aaveOutstandingLoanArray = useAsync(() => getDataByType(CHAIN_ID, personalVaultAddress, 'aave-outstanding-loan'), [personalVaultAddress])
  const aaveCollateralArray = useAsync(() => getDataByType(CHAIN_ID, personalVaultAddress, 'aave-collateral'), [personalVaultAddress])
  const aaveHealthRatioArray = useAsync(() => getDataByType(CHAIN_ID, personalVaultAddress, 'aave-health-ratio'), [personalVaultAddress])
  const uniswapPositionValueArray = useAsync(() => getDataByType(CHAIN_ID, personalVaultAddress, 'uniswap-position-value'), [personalVaultAddress])
  const profitArray = useAsync(() => getDataByType(CHAIN_ID, personalVaultAddress, 'profit'), [personalVaultAddress])
  const { dataSource, loading } = usePersonalData(chain, type, address, type)
  const { baseInfo } = useVaultOnRisk(
    VAULT_FACTORY_ADDRESS,
    VAULT_FACTORY_ABI,
    personalVaultAddress,
    UNISWAPV3_RISK_ON_VAULT,
    UNISWAPV3_RISK_ON_HELPER,
    userProvider
  )

  const { netMarketMakingAmount, result, estimatedTotalAssets, wantInfo = {}, borrowInfo = {} } = baseInfo
  const { wantTokenDecimals = BigNumber.from(0) } = wantInfo
  const { borrowTokenDecimals = BigNumber.from(0) } = borrowInfo

  console.log('borrowTokenDecimals=', borrowTokenDecimals)
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
      content: numeral(toFixed(netMarketMakingAmount, wantTokenDecimals, isUSDi ? TOKEN_DISPLAY_DECIMALS : ETHI_DISPLAY_DECIMALS)).format(
        isUSDi ? '0,0.[00]a' : '0,0.[0000]a'
      ),
      unit: wantTokenSymbol
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
      content: numeral(toFixed(estimatedTotalAssets, wantTokenDecimals, isUSDi ? TOKEN_DISPLAY_DECIMALS : ETHI_DISPLAY_DECIMALS)).format(
        isUSDi ? '0,0.[00]a' : '0,0.[0000]a'
      ),
      isAPY: true,
      unit: wantTokenSymbol
    },
    {
      title: 'Profit',
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
      content: numeral(toFixed(result, wantTokenDecimals, isUSDi ? TOKEN_DISPLAY_DECIMALS : ETHI_DISPLAY_DECIMALS)).format(
        isUSDi ? '0,0.[00]a' : '0,0.[0000]a'
      ),
      isAPY: true,
      unit: wantTokenSymbol
    }
  ]

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12} lg={12}>
        <GridContainer spacing={2}>
          {map(cardProps, (i, index) => {
            return (
              <GridItem key={index} xs={12} sm={12} md={4} lg={4}>
                <Card loading={loading} {...i} />
              </GridItem>
            )
          })}
        </GridContainer>
        <GridContainer className={classes.lineChart}>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <Card
              loading={aaveOutstandingLoanArray.loading || aaveCollateralArray.loading || aaveHealthRatioArray.loading}
              title={
                <span>
                  AAVE Lines
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
              {aaveOutstandingLoanArray.error || aaveCollateralArray.error || aaveHealthRatioArray.error ? (
                <div>Error: {aaveOutstandingLoanArray?.error?.message}</div>
              ) : (
                <LineEchart option={optionForLineChart} style={{ minHeight: '20rem' }} />
              )}
            </Card>
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.lineChart}>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <OnBuilding>
              <Card
                loading={uniswapPositionValueArray.loading}
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
                {uniswapPositionValueArray.error ? (
                  <div>Error: {uniswapPositionValueArray.error.message}</div>
                ) : (
                  <LineEchart option={optionForLineChart} style={{ minHeight: '20rem' }} />
                )}
              </Card>
            </OnBuilding>
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.lineChart}>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <Card
              loading={profitArray.loading}
              title={
                <span>
                  Profits
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
              {profitArray.error ? (
                <div>Error: {profitArray.error.message}</div>
              ) : (
                <LineEchart option={optionForLineChart} style={{ minHeight: '20rem' }} />
              )}
            </Card>
          </GridItem>
        </GridContainer>
      </GridItem>
    </GridContainer>
  )
}

export default MyStatementForRiskOn
