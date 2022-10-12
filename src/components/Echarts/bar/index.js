import React, { memo, useEffect, useState } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GraphicComponent, TooltipComponent, GridComponent, TitleComponent, LegendComponent, ToolboxComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([GraphicComponent, TooltipComponent, GridComponent, BarChart, CanvasRenderer, TitleComponent, LegendComponent, ToolboxComponent])

function Line({ theme = 'light', style = {}, option = {} }) {
  const [echartRef, setRef] = useState(null)
  useEffect(() => {
    if (echartRef) {
      echartRef.getEchartsInstance().setOption(option)
    }
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
