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
        data: levelData.map((d) => d.level.toString()),
        name: 'Level',
        animationDuration: 300,
        animationDurationUpdate: 300,
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Number of Citizens',
        animationDuration: 300,
        animationDurationUpdate: 300,
      },
      series: [
        {
          type: 'bar',
          data: levelData.map((d) => d.count),
        },
      ],
      animationDuration: 0,
      animationDurationUpdate: 3000,
      animationEasing: 'linear',
      animationEasingUpdate: 'linear',
    }

    return chart
  }, [levelData])

  const ref = useEcharts(config)

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
