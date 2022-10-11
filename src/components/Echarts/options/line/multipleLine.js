import { getNoDataGraphic } from '@/components/echarts/options/optionHelper'

/**
 * Multiple line chart
 */
export default function (obj) {
  let data = []
  let dataCount = 0
  let dataArray = []
  dataArray = obj.data
  if (dataArray.length > 0) {
    dataArray.forEach(element => {
      let dataFormat = {
        name: element.seriesName ? element.seriesName : '',
        data: element.seriesData,
        type: 'line',
        showSymbol: element.showSymbol,
        lineStyle: {
          width: 5,
          cap: 'round'
        },
        ...element
      }
      dataCount += element.seriesData.length
      data.push(dataFormat)
    })
  }

  let option = {
    animation: false,
    textStyle: {
      color: '#fff'
    },
    tooltip: {
      trigger: 'axis',
      borderWidth: 0,
      backgroundColor: '#292B2E',
      textStyle: {
        color: '#fff'
      },
      confine: true
    },
    legend: obj.legend,
    xAxis: {
      type: 'category',
      data: obj.xAxisData
    },
    yAxis: {
      type: 'value'
    },
    series: data
  }

  if (obj.tooltipFormatter) {
    option.tooltip.formatter = obj.tooltipFormatter
  }

  return {
    ...getNoDataGraphic(dataCount > 0),
    ...option
  }
}
