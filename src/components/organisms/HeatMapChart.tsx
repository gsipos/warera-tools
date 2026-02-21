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
    const chart: EChartsOption = {
      tooltip: {
        position: 'top',
      },
      grid: {
        height: '75%',
        top: '0%',

        left: '0%',
        right: '0%',

        outerBounds: {
          left: 0,
          right: 0,
        },
      },
      xAxis: {
        type: 'category',
        data: props.xAxisLabels,
      },
      yAxis: {
        type: 'category',
        data: props.yAxisLabels,
      },
    }
    return chart
  }, [props.xAxisLabels, props.yAxisLabels])

  const dataset = useMemo(() => {
    const safeSeriesData = (props.seriesData || []).filter(
      (d) => !(d as unknown[]).includes(undefined) || !(d as unknown[]).includes(null),
    ) as [number, number, number][]
    const values = safeSeriesData.map((d) => d[2]).filter((v) => typeof v === 'number') as number[]
    const min = Math.min(...values)
    const max = Math.max(...values)
    return {
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
      visualMap: {
        min,
        max,
        orient: 'horizontal',
        calculable: true,
        realtime: false,
        inRange: {
          color: [
            '#313695',
            '#4575b4',
            '#74add1',
            '#abd9e9',
            '#e0f3f8',
            '#ffffbf',
            '#fee090',
            '#fdae61',
            '#f46d43',
            '#d73027',
            '#a50026',
          ],
        },
      },
    } as EChartsOption
  }, [props.seriesData])

  const ref = useEcharts(config, dataset)
  return <div ref={ref} className={props.className} />
}
