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
import map from 'lodash/map'
import last from 'lodash/last'
import size from 'lodash/size'
import { toFixed, numberSplit } from '@/helpers/number-format'
import * as ethers from 'ethers'

// === Constants === //
import { VAULT_TYPE } from '@/constants/vault'
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
  let profit = lastProfit?.result || '0'
  const MIN_LENGTH = isUSDi ? 17 : 15
  if (profit.length < MIN_LENGTH) {
    profit = '0'
  }

  const value1 = toFixed(netMarketMakingAmount, wantTokenDecimals)
  const value2 = toFixed(estimatedTotalAssets, wantTokenDecimals)
  const value3 = toFixed(profit, BN_18)
  const value4 = toFixed(currentBorrowWithCanonical, wantTokenDecimals)
  const value5 = toFixed(totalCollateralTokenAmount, wantTokenDecimals)
  const [netMarketMakingAmountText, netMarketMakingAmountSymbol] = numberSplit(value1, isUSDi ? '0,0.[00]' : '0,0.[0000]')
  const [estimatedTotalAssetsText, estimatedTotalAssetsSymbol] = numberSplit(value2, isUSDi ? '0,0.[00]' : '0,0.[0000]')
  const [profitsText, profitsSymbol] = numberSplit(value3, isUSDi ? '0,0.[00]' : '0,0.[0000]')

  const [currentBorrowWithCanonicalText, currentBorrowWithCanonicalSymbol] = numberSplit(value4, isUSDi ? '0,0.[00]' : '0,0.[0000]')

  const [totalCollateralTokenAmountText, totalCollateralTokenAmountSymbol] = numberSplit(value5, isUSDi ? '0,0.[00]' : '0,0.[0000]')

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
      content: <span title={value1}>{netMarketMakingAmountText}</span>,
      unit: [netMarketMakingAmountSymbol, wantTokenSymbol].join(' ')
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
      content: <span title={value2}>{estimatedTotalAssetsText}</span>,
      isAPY: true,
      unit: [estimatedTotalAssetsSymbol, wantTokenSymbol].join(' ')
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
      content: <span title={value3}>{profitsText}</span>,
      isAPY: true,
      unit: [profitsSymbol, wantTokenSymbol].join(' ')
    }
  ]

  const cardProps1 = [
    {
      title: 'AAVE Outstanding Loan',
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          // TODO
          title="AAVE Outstanding Loan"
        >
          <InfoIcon style={{ fontSize: '1.375rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: <span title={value4}>{currentBorrowWithCanonicalText}</span>,
      unit: [currentBorrowWithCanonicalSymbol, wantTokenSymbol].join(' ')
    },
    {
      title: 'AAVE Collateral',
      tip: (
        <Tooltip
          classes={{
            tooltip: classes.tooltip
          }}
          placement="right"
          title="AAVE Collateral"
        >
          <InfoIcon style={{ fontSize: '1.375rem', color: 'rgba(255,255,255,0.45)' }} />
        </Tooltip>
      ),
      content: <span title={value5}>{totalCollateralTokenAmountText}</span>,
      isAPY: true,
      unit: [totalCollateralTokenAmountSymbol, wantTokenSymbol].join(' ')
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
              title={<span>AAVE Debt Ratio (%)</span>}
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
