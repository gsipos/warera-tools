import { useCountries } from '@/api/warera-api'
import { useEcharts } from '@/hooks/use-echarts'
import type { EChartsOption } from 'echarts'
import { useMemo } from 'react'

interface Props {
  className?: string
}

export const CountryAllianceChart = ({ className }: Props) => {
  const countryQuery = useCountries()

  const config = useMemo(() => {
    const countries = countryQuery.data || []

    const nodes = countries.map((e) => ({
      id: e._id,
      name: e.name,
      value: e.rankings.countryActivePopulation.value,
      symbolSize: Math.max(Math.min(e.rankings.countryActivePopulation.value, 25), 1),
      label: {
        show: true,
      },
    }))
    const links = countries
      .map((e) =>
        e.allies.map((a) => ({
          source: e._id,
          target: a,
        })),
      )
      .flat()

    const chart: EChartsOption = {
      tooltip: {},
      series: [
        {
          type: 'graph',
          layout: 'force',
          force: {
            repulsion: 100,
            initLayout: 'circular',
          },
          coordinateSystem: 'view',
          width: '100%',
          height: '100%',
          nodes,
          links,
          symbolSize: 24,
          roam: true,
          draggable: true,
          lineStyle: {
            width: 2,
            opacity: 0.4,
          },
        },
      ],
    }
    return chart
  }, [countryQuery.data])

  const ref = useEcharts(config)
  return <div ref={ref} className={className} />
}
