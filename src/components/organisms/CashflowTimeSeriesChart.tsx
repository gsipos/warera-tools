import { useEcharts } from '@/hooks/use-echarts'
import { EChartsOption } from 'echarts'
import { useMemo } from 'react'

export interface CashflowDataPoint {
  date: string
  income: number
  spending: number
  [key: string]: string | number
}

interface Props {
  dataset: CashflowDataPoint[]
  className?: string
}

export const CashflowTimeSeriesChart = (props: Props) => {
  const config = useMemo<EChartsOption>(() => {
    return {
      tooltip: {
        trigger: 'axis',
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
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        right: 'center',
      },
      series: [
        {
          name: 'Income',
          type: 'line',
          smooth: true,
          showSymbol: false,
        },
        {
          name: 'Spending',
          type: 'line',
          smooth: true,
          showSymbol: false,
        },
      ],
    }
  }, [])

  const dataset = useMemo<EChartsOption>(() => {
    return {
      dataset: {
        dimensions: ['date', 'income', 'spending'],
        source: props.dataset,
      },
    }
  }, [props.dataset])

  // Need to cast the ref because useEcharts returns MutableRefObject<HTMLDivElement> but the div expects LegacyRef
  // However, looking at existing usage: <div ref={ref} ... /> works fine.
  const ref = useEcharts(config, dataset)

  return <div ref={ref} className={props.className} />
}
