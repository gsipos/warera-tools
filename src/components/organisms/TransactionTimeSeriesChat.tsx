import { useEcharts } from '@/hooks/use-echarts'
import { DailyTransactionSummary } from '@/hooks/use-item-market-price'
import { EChartsOption } from 'echarts'
import { useMemo } from 'react'

type DataSetDimensions = 'date' | 'min' | 'avg' | 'max' | 'count'

interface Props {
  timeSeries: Pick<DailyTransactionSummary, DataSetDimensions>[]
  dimensions?: DataSetDimensions[]
  className?: string
}

export const TransactionTimeSeriesChart = (props: Props) => {
  const config = useMemo(() => {
    const chart: EChartsOption = {
      tooltip: {
        position: 'top',
      },
      animationThreshold: 2000,
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
          type: 'line',
          smooth: true,
        },
        {
          type: 'line',
          smooth: true,
        },
        {
          type: 'line',
          smooth: true,
        },
      ],
    }
    return chart
  }, [])

  const dataset = useMemo(() => {
    return {
      dataset: {
        dimensions: props.dimensions || ['date', 'min', 'avg', 'max', 'count'],
        source: props.timeSeries,
      },
    }
  }, [props.timeSeries])

  const ref = useEcharts(config, dataset)
  return <div ref={ref} className={props.className} />
}
