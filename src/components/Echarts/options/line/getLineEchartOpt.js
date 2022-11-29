import moment from 'moment'
import lineSimple from '@/components/Echarts/options/line/lineSimple'
import forEach from 'lodash/forEach'
import isNaN from 'lodash/isNaN'
import isUndefined from 'lodash/isUndefined'
import isNil from 'lodash/isNil'
import filter from 'lodash/filter'
import size from 'lodash/size'

const getLineEchartOpt = (data, dataValueKey, seriesName, options = {}) => {
  const {
    format = 'MM-DD HH:mm',
    xAxis,
    yAxis,
    smooth = false,
    step,
    dataZoom,
    needMinMax = true,
    yAxisMin = value => parseInt(value.min * 0.9999 * 10 ** 4) / 10 ** 4,
    yAxisMax = value => parseInt(value.max * 1.0001 * 10 ** 4) / 10 ** 4,
    tootlTipSuffix = '(UTC)',
    tootlTipFormat = 'YYYY-MM-DD HH:mm'
  } = options
  const xAxisData = []
  const seriesData = []
  const xAxisLabels = {}
  data.forEach(o => {
    // TODO: need comments
    let value = moment(o.date).add(1, 'days').format(tootlTipFormat)
    if (tootlTipSuffix) {
      value = `${value} ${tootlTipSuffix}`
    }
    xAxisLabels[value] = moment(o.date).add(1, 'days').format(format)
    xAxisData.push(value)
    seriesData.push(o[dataValueKey])
  })
  const option = lineSimple({
    xAxisData,
    seriesName: seriesName,
    seriesData,
    smooth,
    dataZoom
  })
  option.yAxis = {
    ...option.yAxis,
    ...yAxis
  }
  option.xAxis = {
    axisLabel: {
      formatter: value => xAxisLabels[value]
    },
    ...option.xAxis,
    ...xAxis
  }
  option.yAxis.splitLine = {
    lineStyle: {
      color: '#454459'
    }
  }
  if (needMinMax) {
    option.yAxis.min = yAxisMin
    option.yAxis.max = yAxisMax
    option.yAxis.axisLabel = {
      showMinLabel: false,
      showMaxLabel: false
    }
  }
  option.series[0].connectNulls = true
  option.series[0].showSymbol = size(filter(seriesData, i => !isNil(i))) === 1
  option.series[0].lineStyle = {
    width: 5,
    cap: 'round'
  }
  if (step) {
    const seriesData = option.series[0].data
    forEach(seriesData, (value, index) => {
      if ((isUndefined(value) || isNaN(value)) && index !== 0) {
        seriesData[index] = seriesData[index - 1]
      }
    })
  }
  return option
}

export default getLineEchartOpt
