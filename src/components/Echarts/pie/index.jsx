import React, { memo, useEffect, useState } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { GraphicComponent, TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([GraphicComponent, TooltipComponent, GridComponent, PieChart, CanvasRenderer])

function Line({ theme = 'light', style = {}, option = {} }) {
  const [echartRef, setRef] = useState(null)

  useEffect(() => {
    if (echartRef) {
      echartRef.getEchartsInstance().setOption(option)
    }
  }, [echartRef, option])

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
