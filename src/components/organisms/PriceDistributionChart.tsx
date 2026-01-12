import { useEcharts } from '@/hooks/use-echarts'
import { EChartsOption } from 'echarts'
import { useMemo } from 'react'

interface DataEntry {
  name: string
  min: number
  avg: number
  max: number
  count: number
}

interface Props {
  className?: string
  dataSet: DataEntry[]
}

export const PriceDistributionChart = (props: Props) => {
  const config = useMemo(() => {
    const chart: EChartsOption = {
      tooltip: {
        position: 'top',
      },

      dataset: {
        dimensions: ['name', 'min', 'avg', 'max'],
        source: props.dataSet,
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
      },
      yAxis: {},
      legend: {
        orient: 'horizontal',
        bottom: 10,
        right: 'center',
      },
      series: [
        {
          type: 'bar',

          label: {
            show: true,
          },
        },
        {
          type: 'line',

          label: {
            show: true,
          },
        },
        {
          type: 'bar',

          label: {
            show: true,
          },
        },
      ],
    }
    return chart
  }, [props.dataSet])
  const ref = useEcharts(config)
  return <div ref={ref} className={props.className} />
}
