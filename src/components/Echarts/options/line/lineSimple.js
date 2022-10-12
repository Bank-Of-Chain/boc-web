import isEmpty from 'lodash/isEmpty'
import { getNoDataGraphic } from '@/components/Echarts/options/optionHelper'

/**
 * Created by linyu on 2018/5/3.
 */

const DATA_ZOOM_HEIGHT = '52px'

export default function (obj) {
  const showDataZoom = !isEmpty(obj.seriesData) && obj.dataZoom
  const option = {
    animation: false,
    textStyle: {
      color: '#fff'
    },
    grid: {
      top: 40,
      left: '0%',
      right: '5%',
      bottom: showDataZoom ? DATA_ZOOM_HEIGHT : '0%',
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
    xAxis: {
      type: 'category',
      data: obj.xAxisData
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: showDataZoom ? obj.dataZoom : null,
    color: ['#A68EFE', '#5470c6', '#91cc75'],
    series: [
      {
        name: obj.seriesName ? obj.seriesName : '',
        data: obj.seriesData,
        type: 'line',
        lineStyle: {
          color: obj.color
            ? obj.color
            : {
                type: 'linear',
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgb(204, 186, 250)'
                  },
                  {
                    offset: 0.5,
                    color: 'rgb(144, 123, 247)'
                  },
                  {
                    offset: 0.6,
                    color: 'rgb(95, 128, 249)'
                  },
                  {
                    offset: 0.95,
                    color: 'rgb(80, 132, 250)'
                  },
                  {
                    offset: 1,
                    color: 'rgb(166, 192, 252)'
                  }
                ]
              },
          width: 3
        },
        smooth: obj.smooth,
        step: obj.step
      }
    ]
  }

  return {
    ...getNoDataGraphic(obj.seriesData.length > 0),
    ...option
  }
}
