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
import { toFixed } from '@/helpers/number-format'
import * as ethers from 'ethers'

// === Constants === //
import { ETHI_DISPLAY_DECIMALS } from '@/constants/ethi'
import { TOKEN_DISPLAY_DECIMALS } from '@/constants/vault'
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
    UNISWAPV3_RISK_ON_HELPER
  } = props

  const isUSDi = type === 'USDi'
  const classes = useStyles()

  // api datas fetching
  const aaveOutstandingLoan = useAsync(() => getDataByType(CHAIN_ID, personalVaultAddress, 'aave-outstanding-loan'), [personalVaultAddress])
  const aaveCollateral = useAsync(() => getDataByType(CHAIN_ID, personalVaultAddress, 'aave-collateral'), [personalVaultAddress])
  const aaveHealthRatio = useAsync(() => getDataByType(CHAIN_ID, personalVaultAddress, 'aave-health-ratio'), [personalVaultAddress])
  const uniswapPositionValueArray = useAsync(() => getDataByType(CHAIN_ID, personalVaultAddress, 'uniswap-position-value'), [personalVaultAddress])
  const profitArray = useAsync(() => getDataByType(CHAIN_ID, personalVaultAddress, 'profit'), [personalVaultAddress])
  const { loading } = usePersonalData(chain, type, address, type)
  const { baseInfo } = useVaultOnRisk(
    VAULT_FACTORY_ADDRESS,
    VAULT_FACTORY_ABI,
    personalVaultAddress,
    UNISWAPV3_RISK_ON_VAULT,
    UNISWAPV3_RISK_ON_HELPER,
    userProvider
  )

  const { netMarketMakingAmount, result, estimatedTotalAssets, wantInfo = {} } = baseInfo
  const { wantTokenDecimals = BigNumber.from(0) } = wantInfo

  const aaveOption = {
    grid: {
      top: 40,
      left: '0%',
      right: '5%',
      bottom: '0%',
      containLabel: true
    },
    legend: {
      textStyle: {
        color: '#fff'
      }
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
      data: map(aaveOutstandingLoan.result, item => item.validateTime)
    },
    yAxis: [
      {
        splitLine: {
          lineStyle: {
            color: '#454459'
          }
        }
      },
      {
        max: 1,
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
        name: 'AAVE Outstanding Loan',
        data: map(aaveOutstandingLoan.result, item => toFixed(item.result, BN_18, 2))
      },
      {
        type: 'line',
        name: 'AAVE Collateral',
        data: map(aaveCollateral.result, item => toFixed(item.result, BN_18, 2))
      },
      {
        type: 'line',
        yAxisIndex: 1,
        name: 'Health Ratio',
        data: map(aaveHealthRatio.result, item => Number(item.result).toFixed(4)),
        markLine: {
          symbol: 'none',
          data: [
            {
              lineStyle: {
                color: '#fff'
              },
              label: {
                formatter: '加杠杆'
              },
              yAxis: 0.4
            },
            {
              lineStyle: {
                color: '#fff'
              },
              label: {
                formatter: '减杠杆'
              },
              yAxis: 0.7
            },
            {
              lineStyle: {
                color: '#fff'
              },
              label: {
                formatter: '清算线'
              },
              yAxis: 0.8
            }
          ]
        }
      }
    ]
  }

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
      xAxis: {
        axisTick: {
          alignWithLabel: true
        }
      }
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
        <GridContainer className={classes.lineChart}>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <Card
              loading={aaveOutstandingLoan.loading || aaveCollateral.loading || aaveHealthRatio.loading}
              title={
                <span>
                  AAVE Lines
                  <Tooltip title="AAVE Outstanding Loan, Collateral, Health Ratio">
                    <InfoIcon style={{ marginLeft: 8, fontSize: '1rem' }} />
                  </Tooltip>
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
                <LineEchart option={aaveOption} style={{ minHeight: '20rem' }} />
              )}
            </Card>
          </GridItem>
        </GridContainer>
        <GridContainer className={classes.lineChart}>
          <GridItem xs={12} sm={12} md={12} lg={12}>
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
                <LineEchart option={uniswapOption} style={{ minHeight: '20rem' }} />
              )}
            </Card>
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
                <LineEchart
                  option={getLineEchartOpt(
                    map(profitArray.result, i => {
                      return {
                        date: i.validateTime,
                        value: toFixed(i.result, BN_18)
                      }
                    }),
                    'value',
                    wantTokenSymbol,
                    {
                      format: 'MM-DD',
                      xAxis: {
                        axisTick: {
                          alignWithLabel: true
                        }
                      }
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
