import { useEcharts } from '@/hooks/use-echarts'
import { EChartsOption } from 'echarts'
import { useMemo } from 'react'

interface Props {
  className?: string
  xAxisLabels: string[]
  yAxisLabels: string[]
  seriesData: [number, number, number][]
}

export const HeatMapChart = (props: Props) => {
  const config = useMemo(() => {
    const safeSeriesData = (props.seriesData || []).filter(
      (d) => !(d as unknown[]).includes(undefined) || !(d as unknown[]).includes(null),
    ) as [number, number, number][]
    const values = safeSeriesData.map((d) => d[2]).filter((v) => typeof v === 'number') as number[]
    const min = Math.min(...values)
    const max = Math.max(...values)
    const chart: EChartsOption = {
      tooltip: {
        position: 'top',
      },
      grid: {
        height: '75%',
        top: '0%',

        left: '0%',
        right: '0%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: props.xAxisLabels,
      },
      yAxis: {
        type: 'category',
        data: props.yAxisLabels,
      },
      visualMap: {
        min,
        max,
        orient: 'horizontal',
      },
      series: [
        {
          name: 'Data',
          type: 'heatmap',
          data: safeSeriesData,
          label: {
            show: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    }
    return chart
  }, [props.xAxisLabels, props.yAxisLabels, props.seriesData])
  const ref = useEcharts(config)
  return <div ref={ref} className={props.className} />
}
