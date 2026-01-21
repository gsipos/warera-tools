import { useCountryUsersLevelAggregated } from '@/hooks/game/use-country-user-level-aggregated'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useEcharts } from '@/hooks/use-echarts'
import { EChartsOption } from 'echarts'

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
    <Card className={className}>
      <CardHeader>
        <CardTitle>Citizens by level</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={ref} className="h-80 w-120" />
      </CardContent>
    </Card>
  )
}
