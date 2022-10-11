import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import classnames from 'classnames'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Card from '@/components/Card'
import { LineEchart, BarEchart } from '@/components/Echarts'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'

// === Services === //
import getLineEchartOpt from '@/components/Echarts/options/line/getLineEchartOpt'
import { getSegmentProfit } from '@/services/api-service'

// === Hooks === //
import usePersonalData from '@/hooks/usePersonalData'

// === Utils === //
import moment from 'moment'
import numeral from 'numeral'
import map from 'lodash/map'
import reverse from 'lodash/reverse'
import isEmpty from 'lodash/isEmpty'
import findIndex from 'lodash/findIndex'
import { toFixed } from '@/helpers/number-format'

// === Constants === //
import { SEGMENT_TYPES, DAY, WEEK, MONTH } from '@/constants/date'
import { ETHI_BN_DECIMALS, ETHI_DISPLAY_DECIMALS, ETHI_PROFITS_DISPLAY_DECIMALS } from '@/constants/ethi'
import { TOKEN_DISPLAY_DECIMALS } from '@/constants/vault'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)

const getMarker = color => {
  return `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`
}

const MyStatement = props => {
  const { address, type, chain } = props

  const isUSDi = type === 'USDi'
  const classes = useStyles()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [segmentType, setSegmentType] = useState(DAY)
  const [optionForLineChart, setOptionForLineChart] = useState({})
  const [optionForBarChart, setOptionForBarChart] = useState({})
  const { dataSource, loading: chartLoading } = usePersonalData(chain, type, address, type)

  const titleRender = (title = '') => {
    const isWeek = segmentType === WEEK
    if (isWeek) {
      const [, index] = title.split('-')
      return `No.${index}`
    }
    const isMonth = segmentType === MONTH
    if (isMonth) {
      return `${moment(title).format('MMM')}.`
    }

    const isDay = segmentType === DAY
    if (isDay) {
      const [, m, d] = title.split('-')
      return `${m}-${d}`
    }
    return title
  }

  useEffect(() => {
    if (isEmpty(segmentType)) return
    setLoading(true)
    getSegmentProfit(address, chain, type, segmentType)
      .then(resp => {
        setData(
          map(reverse(resp.profits), i => {
            return {
              ...i,
              segmentTime: titleRender(i.segmentTime),
              value: 1 * i.profit
            }
          })
        )
      })
      .finally(() =>
        setTimeout(() => {
          setLoading(false)
        }, 500)
      )
  }, [chain, address, type, segmentType])

  const { tvls = [] } = dataSource
  // https://github.com/PiggyFinance/dashboard/issues/166
  const reverseArray = reverse([...tvls])
  const continuousIndex = findIndex(reverseArray, (item, index) => {
    if (index <= 2) return false
    if (index === reverseArray.length) return true
    return Math.abs(item.balance - reverseArray[index - 1].balance) > item.balance * 0.005
  })
  const startPercent = continuousIndex === -1 ? 0 : 100.5 - (100 * continuousIndex) / tvls.length

  useEffect(() => {
    const option1 = getLineEchartOpt(tvls, 'balance', dataSource.token, {
      format: 'MM-DD',
      dataZoom: [
        {
          start: startPercent,
          end: 100
        }
      ],
      xAxis: {
        axisTick: {
          alignWithLabel: true
        }
      }
    })
    setOptionForLineChart(option1)
  }, [tvls, address])

  useEffect(() => {
    const option = {
      title: {
        show: true,
        textStyle: {
          color: 'rgb(157 157 157)',
          fontSize: 25
        },
        text: isEmpty(data) ? 'No Data' : '',
        left: 'center',
        top: 'center'
      },
      textStyle: {
        color: '#fff'
      },
      color: ['#A68EFE', '#5470c6'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params) {
          const param = params[0]
          console.log('params=', param)
          let message = ''
          message += `${param.name}`
          message += `<br/>${param.marker}${param.seriesName}: ${toFixed(
            `${param.value}`,
            1,
            isUSDi ? TOKEN_DISPLAY_DECIMALS : ETHI_PROFITS_DISPLAY_DECIMALS
          )}`
          if (segmentType === WEEK) {
            message += `<br/>${getMarker('#fff')}Begin: ${param.data.segmentBegin}`
            message += `<br/>${getMarker('#fff')}End: ${param.data.segmentEnd}`
          }
          return message
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        data: map(data, 'segmentTime'),
        axisLine: { onZero: true },
        splitLine: { show: false },
        splitArea: { show: false },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        splitLine: {
          lineStyle: {
            color: '#454459'
          }
        }
      },
      series: [
        {
          name: 'Profits',
          type: 'bar',
          data: data
        }
      ]
    }
    setOptionForBarChart(option)
  }, [data, address])

  const { day7Apy, day30Apy, profit, latestProfit = { profit: '0', tokenType: '' } } = dataSource
  const cardProps = [
    {
      title: 'Profits',
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
      content: numeral(toFixed(profit, ETHI_BN_DECIMALS, isUSDi ? TOKEN_DISPLAY_DECIMALS : ETHI_DISPLAY_DECIMALS)).format(
        isUSDi ? '0,0.[00]' : '0,0.[0000]'
      ),
      footer: (
        <span>
          {`+${numeral(latestProfit?.profit).format(isUSDi ? '0,0.[00]' : '0,0.[000000]')} ${latestProfit?.tokenType}`}&nbsp;&nbsp;
          <Tooltip
            classes={{
              tooltip: classes.tooltip
            }}
            placement="right"
            title={'Profits obtained each time after rebase.'}
          >
            <InfoIcon style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)' }} />
          </Tooltip>
        </span>
      ),
      unit: latestProfit?.tokenType
    },
    {
      title: 'APY (last 7 days)',
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
      content: numeral(day7Apy?.apy).format('0,0.00'),
      isAPY: true,
      unit: '%'
    },
    {
      title: 'APY (last 30 days)',
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
      content: numeral(day30Apy?.apy).format('0,0.00'),
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
                  {isUSDi ? 'USDi' : 'ETHi'} variation curve
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
        <GridContainer className={classes.barChart}>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <Card
              loading={loading}
              title="Profits"
              tip={
                <ButtonGroup
                  classes={{
                    groupedOutlinedPrimary: classes.groupedOutlinedPrimary
                  }}
                  value={segmentType}
                  size="small"
                  color="primary"
                >
                  {map(SEGMENT_TYPES, (value, key) => (
                    <Button
                      className={classnames({ [classes.groupButtonCheck]: value === segmentType })}
                      onClick={() => setSegmentType(value)}
                      key={key}
                    >
                      {value}
                    </Button>
                  ))}
                </ButtonGroup>
              }
              loadingOption={{
                width: '100%',
                height: '2rem'
              }}
            >
              <BarEchart option={optionForBarChart} style={{ minHeight: '20rem', width: '100%' }} />
            </Card>
          </GridItem>
        </GridContainer>
      </GridItem>
    </GridContainer>
  )
}

export default MyStatement
