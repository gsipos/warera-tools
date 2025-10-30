import { getInstanceByDom, init } from 'echarts'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { EChartsOption } from 'echarts'

export const useEcharts = (config: EChartsOption) => {
  const ref = useRef<HTMLDivElement>(undefined as any)

  useEffect(() => {
    if (ref.current) {
      const chartInstance = init(ref.current)
      const resizeChart = () => chartInstance.resize()
      window.addEventListener('resize', resizeChart)
      return () => {
        chartInstance.dispose()
        window.removeEventListener('resize', resizeChart)
      }
    }
  }, [ref, config])

  useEffect(() => {
    if (ref.current) {
      const chartInstance = getInstanceByDom(ref.current)
      chartInstance?.setOption(config)
    }
  }, [ref, config])

  useLayoutEffect(() => {
    if (ref.current) {
      const chartInstance = getInstanceByDom(ref.current)
      chartInstance?.resize()
    }
  })

  return ref
}
