import React from 'react'
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
import { getDataByType } from '@/services/api-service'

// === Hooks === //
import usePersonalData from '@/hooks/usePersonalData'
import useVaultOnRisk from '@/hooks/useVaultOnRisk'
import { useAsync } from 'react-async-hook'

// === Utils === //
import numeral from 'numeral'
import map from 'lodash/map'
import last from 'lodash/last'
import size from 'lodash/size'
import { toFixed } from '@/helpers/number-format'
import * as ethers from 'ethers'

// === Constants === //
import { ETHI_DISPLAY_DECIMALS } from '@/constants/ethi'
import { VAULT_TYPE, TOKEN_DISPLAY_DECIMALS } from '@/constants/vault'
import { CHAIN_ID } from '@/constants'
import { BN_18 } from '@/constants/big-number'

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
    UNISWAPV3_RISK_ON_HELPER,
    currentLiquidationThreshold
  } = props

  const isUSDi = type === VAULT_TYPE.USDr
  const classes = useStyles()

  // api datas fetching
  const aaveOutstandingLoan = useAsync(
    () => getDataByType(CHAIN_ID, personalVaultAddress, 'aave-outstanding-loan').catch(() => []),
    [personalVaultAddress]
  )
  const aaveCollateral = useAsync(() => getDataByType(CHAIN_ID, personalVaultAddress, 'aave-collateral').catch(() => []), [personalVaultAddress])
  const aaveHealthRatio = useAsync(() => getDataByType(CHAIN_ID, personalVaultAddress, 'aave-health-ratio').catch(() => []), [personalVaultAddress])
  const uniswapPositionValueArray = useAsync(
    () => getDataByType(CHAIN_ID, personalVaultAddress, 'uniswap-position-value').catch(() => []),
    [personalVaultAddress]
  )
  const profitArray = useAsync(() => getDataByType(CHAIN_ID, personalVaultAddress, 'profit').catch(() => []), [personalVaultAddress])
  const { loading } = usePersonalData(chain, type, address, type)
  const { baseInfo } = useVaultOnRisk(
    VAULT_FACTORY_ADDRESS,
    VAULT_FACTORY_ABI,
    personalVaultAddress,
    UNISWAPV3_RISK_ON_VAULT,
    UNISWAPV3_RISK_ON_HELPER,
    userProvider
  )
  const { netMarketMakingAmount, estimatedTotalAssets, wantInfo = {}, currentBorrowWithCanonical, totalCollateralTokenAmount } = baseInfo
  const { wantTokenDecimals = BigNumber.from(0) } = wantInfo

  const aaveOption = {
    animation: false,
    grid: {
      top: 40,
      left: '0%',
      right: '5%',
      bottom: '10',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      borderWidth: 0,
      backgroundColor: '#292B2E',
      textStyle: {
        color: '#fff'
      }
    },
    textStyle: {
      color: '#fff'
    },
    color: ['#A68EFE', '#5470c6', '#91cc75'],
    xAxis: {
      axisTick: {
        alignWithLabel: true
      },
      data: map(aaveHealthRatio.result, item => item.validateTime)
    },
    yAxis: [
      {
        max: 100,
        min: 0,
        splitLine: {
          lineStyle: {
            color: '#454459'
          }
        }
      }
    ],
    series: [
      {
        type: 'line',
        name: 'Debt Ratio',
        showSymbol: size(aaveHealthRatio.result) === 1,
        lineStyle: {
          width: 4
        },
        data: map(aaveHealthRatio.result, item => (Number(item.result) * 100).toFixed(2)),
        tooltip: {
          valueFormatter: value => `${value}%`
        },
        markLine: {
          symbol: 'none',
          data: [
            {
              lineStyle: {
                color: '#07a2a4',
                type: 'solid'
              },
              label: {
                formatter: 'Leverage Upper 40%',
                position: 'middle',
                color: '#999'
              },
              yAxis: 40
            },
            {
              lineStyle: {
                color: '#ffb980',
                type: 'solid'
              },
              label: {
                formatter: 'Leverage Lower 75%',
                position: 'middle',
                color: '#999'
              },
              yAxis: 75
            },
            {
              lineStyle: {
                color: '#dc69aa',
                type: 'solid'
              },
              label: {
                formatter: `Liquidation ${currentLiquidationThreshold}%`,
                position: 'middle',
                color: '#999'
              },
              yAxis: currentLiquidationThreshold
            }
          ]
        }
      }
    ]
  }

  const lastProfit = last(profitArray.result)
  const cardProps = [
    {
      title: 'Net Deposit',
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          // TODO
          title="Net Deposit"
        >
          <InfoIcon style={{ fontSize: '1.375rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: (
        <span title={toFixed(netMarketMakingAmount, wantTokenDecimals)}>
          {numeral(toFixed(netMarketMakingAmount, wantTokenDecimals, isUSDi ? TOKEN_DISPLAY_DECIMALS : ETHI_DISPLAY_DECIMALS)).format(
            isUSDi ? '0,0.[00]a' : '0,0.[0000]a'
          )}
        </span>
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
          title="Current Value"
        >
          <InfoIcon style={{ fontSize: '1.375rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: (
        <span title={toFixed(estimatedTotalAssets, wantTokenDecimals)}>
          {numeral(toFixed(estimatedTotalAssets, wantTokenDecimals, isUSDi ? TOKEN_DISPLAY_DECIMALS : ETHI_DISPLAY_DECIMALS)).format(
            isUSDi ? '0,0.[00]a' : '0,0.[0000]a'
          )}
        </span>
      ),
      isAPY: true,
      unit: wantTokenSymbol
    },
    {
      title: 'Profits',
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title="Profits"
        >
          <InfoIcon style={{ fontSize: '1.375rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: (
        <span title={toFixed(lastProfit?.result, BN_18)}>
          {numeral(toFixed(lastProfit?.result, BN_18, isUSDi ? TOKEN_DISPLAY_DECIMALS : ETHI_DISPLAY_DECIMALS)).format(
            isUSDi ? '0,0.[00]a' : '0,0.[0000]a'
          )}
        </span>
      ),
      isAPY: true,
      unit: wantTokenSymbol
    }
  ]

  const cardProps1 = [
    {
      title: 'Outstanding Loan',
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          // TODO
          title="Outstanding Loan"
        >
          <InfoIcon style={{ fontSize: '1.375rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: (
        <span title={toFixed(currentBorrowWithCanonical, wantTokenDecimals)}>
          {numeral(toFixed(currentBorrowWithCanonical, wantTokenDecimals, isUSDi ? TOKEN_DISPLAY_DECIMALS : ETHI_DISPLAY_DECIMALS)).format(
            isUSDi ? '0,0.[00]a' : '0,0.[0000]a'
          )}
        </span>
      ),
      unit: wantTokenSymbol
    },
    {
      title: 'Collateral',
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title="Collateral"
        >
          <InfoIcon style={{ fontSize: '1.375rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: (
        <span title={toFixed(totalCollateralTokenAmount, wantTokenDecimals)}>
          {numeral(toFixed(totalCollateralTokenAmount, wantTokenDecimals, isUSDi ? TOKEN_DISPLAY_DECIMALS : ETHI_DISPLAY_DECIMALS)).format(
            isUSDi ? '0,0.[00]a' : '0,0.[0000]a'
          )}
        </span>
      ),
      isAPY: true,
      unit: wantTokenSymbol
    }
  ]

  const uniswapOption = getLineEchartOpt(
    map(uniswapPositionValueArray.result, i => {
      return {
        date: i.validateTime,
        value: toFixed(i.result, BN_18)
      }
    }),
    'value',
    wantTokenSymbol,
    {
      format: 'MM-DD',
      tootlTipFormat: 'YYYY-MM-DD',
      xAxis: {
        axisTick: {
          alignWithLabel: true
        }
      },
      tootlTipSuffix: ''
    }
  )

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
        <GridContainer spacing={2}>
          {map(cardProps1, (i, index) => {
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
              loading={aaveOutstandingLoan.loading || aaveCollateral.loading || aaveHealthRatio.loading}
              title={
                <span>
                  Debt Ratio (%)
                </span>
              }
              loadingOption={{
                width: '100%',
                height: '2rem'
              }}
            >
              {aaveOutstandingLoan.error || aaveCollateral.error || aaveHealthRatio.error ? (
                <div>Error: {aaveOutstandingLoan?.error?.message}</div>
              ) : (
                <LineEchart option={aaveOption} style={{ minHeight: '30rem' }} />
              )}
            </Card>
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.lineChart}>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <Card
              loading={uniswapPositionValueArray.loading}
              title={<span>Uniswap Position Value</span>}
              loadingOption={{
                width: '100%',
                height: '2rem'
              }}
            >
              {uniswapPositionValueArray.error ? (
                <div>Error: {uniswapPositionValueArray.error.message}</div>
              ) : (
                <LineEchart option={uniswapOption} style={{ minHeight: '20rem' }} />
              )}
            </Card>
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.lineChart}>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <Card
              loading={profitArray.loading}
              title={<span>Profits</span>}
              loadingOption={{
                width: '100%',
                height: '2rem'
              }}
            >
              {profitArray.error ? (
                <div>Error: {profitArray.error.message}</div>
              ) : (
                <LineEchart
                  option={getLineEchartOpt(
                    map(profitArray.result, i => {
                      return {
                        date: i.validateTime,
                        value: toFixed(i.result, BN_18, isUSDi ? 6 : 18)
                      }
                    }),
                    'value',
                    wantTokenSymbol,
                    {
                      format: 'MM-DD',
                      tootlTipFormat: 'YYYY-MM-DD',
                      xAxis: {
                        axisTick: {
                          alignWithLabel: true
                        }
                      },
                      tootlTipSuffix: '',
                      yAxisMin: () => {},
                      yAxisMax: () => {}
                    }
                  )}
                  style={{ minHeight: '20rem' }}
                />
              )}
            </Card>
          </GridItem>
        </GridContainer>
      </GridItem>
    </GridContainer>
  )
}

export default MyStatementForRiskOn
