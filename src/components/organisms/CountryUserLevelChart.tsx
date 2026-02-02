import { useCountryUsersLevelAggregated } from '@/hooks/game/use-country-user-level-aggregated'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useEcharts } from '@/hooks/use-echarts'
import { EChartsOption } from 'echarts'
import { cn } from '@/lib/utils'

interface Props {
  countryId: string
  className?: string
}

export const CountryUserLevelChart = ({ countryId, className }: Props) => {
  const levelData = useCountryUsersLevelAggregated(countryId)

  const config = useMemo(() => {
    const chart: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        name: 'Level',
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Number of Citizens',
      },
      series: [
        {
          type: 'bar',
          encode: {
            x: 'level',
            y: 'count',
          },
        },
      ],
      animationThreshold: 2000,
    }

    return chart
  }, [])

  const dataset = useMemo(
    () => ({
      dataset: {
        dimensions: ['level', 'count'],
        source: levelData,
      },
    }),
    [levelData],
  )

  const ref = useEcharts(config, dataset)

  return (
    <Card className={cn('w-90 max-w-240 shrink-1 grow-1', className)}>
      <CardHeader>
        <CardTitle>Citizens by level</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={ref} className="h-80 w-full grow-1" />
      </CardContent>
    </Card>
  )
}
