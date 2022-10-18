import React, { memo, useEffect, useState } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GraphicComponent, TooltipComponent, GridComponent, LegendComponent, DataZoomSliderComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { UniversalTransition } from 'echarts/features'

echarts.use([
  GraphicComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomSliderComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition
])

function Line({ theme = 'light', style = {}, option = {} }) {
  const [echartRef, setRef] = useState(null)
  useEffect(() => {
    if (echartRef) {
      echartRef.getEchartsInstance().setOption(option)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [option])
  return (
    <ReactEChartsCore
      key="echart"
      ref={e => setRef(e)}
      echarts={echarts}
      option={option}
      theme={theme}
      style={style}
      notMerge={true}
      lazyUpdate={true}
    />
  )
}

export default memo(Line, (prev, next) => prev.option === next.option)
