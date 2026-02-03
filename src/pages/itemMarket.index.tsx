import { useTransactions } from '@/api/warera-api'
import { armorCodes, equipmentCodes, weaponsCodes } from '@/api/warera-api-schema'
import { EquipmentGridSelect } from '@/components/molecules/EquipmentGridSelect'
import { HeatMapChart } from '@/components/organisms/HeatMapChart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { WarEra } from 'warera-api'
import { ErrorBoundary } from 'react-error-boundary'
import z from 'zod'
import { zodValidator, fallback } from '@tanstack/zod-adapter'
import { PriceDistributionChart } from '@/components/organisms/PriceDistributionChart'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  AggregatedTx,
  useAggregatedTransactions,
  useEquipmentTransactions,
  useTransactionTimeSeries,
} from '@/hooks/use-item-market-price'
import { TransactionTimeSeriesChart } from '@/components/organisms/TransactionTimeSeriesChat'
import { TimeRangeSelect } from '@/components/molecules/TimeRangeSelect'

const itemMarketSearchSchema = z.object({
  code: fallback(z.enum(equipmentCodes).default('gun'), 'gun'),
})

type ItemMarketSearch = z.infer<typeof itemMarketSearchSchema>

export const Route = createFileRoute('/itemMarket/')({
  component: RouteComponent,
  validateSearch: zodValidator(itemMarketSearchSchema),
})

const SingleSkillChart = ({ txGroups }: { txGroups: AggregatedTx[] }) => {
  const skillNames = Object.keys(txGroups.at(0)?.skills ?? {}) || []
  const firstSkill = skillNames[0] || ''

  const dataSet = txGroups
    .map((tx) => ({
      name: '' + tx.skills[firstSkill],
      min: tx.min,
      avg: tx.avg,
      max: tx.max,
      count: tx.count,
    }))
    .toSorted((a, b) => (Number(a.name) || 0) - (Number(b.name) || 0))
  return (
    <Card className="w-full max-w-140">
      <CardHeader>
        <CardTitle>Prices by {firstSkill} min/avg/max</CardTitle>
      </CardHeader>
      <CardContent>
        <ErrorBoundary
          resetKeys={[dataSet]}
          fallback={<div className="text-red-500">Failed to load heatmap chart.</div>}
        >
          <PriceDistributionChart className="h-120 w-full max-w-140" dataSet={dataSet} />
        </ErrorBoundary>
      </CardContent>
    </Card>
  )
}

const DualSkillTxHeatmap = ({
  txGroups,
  type,
}: {
  txGroups: AggregatedTx[]
  type: 'min' | 'max' | 'count' | 'avg'
}) => {
  const skillNames = Object.keys(txGroups.at(0)?.skills ?? {}) || []
  const firstSkill = skillNames[0] || ''
  const secondSkill = skillNames[1] || ''

  const firstSkillValues = [...new Set(txGroups.map((tx) => tx.skills[firstSkill] as number))]
    .filter((x) => !!x)
    .toSorted((a, b) => a - b)
  const secondSkillValues = [...new Set(txGroups.map((tx) => tx.skills[secondSkill] as number))]
    .filter((x) => !!x)
    .toSorted((a, b) => a - b)

  const series: [number, number, number][] = txGroups.map((tx) => [
    firstSkillValues.indexOf(tx.skills[firstSkill] as number),
    secondSkillValues.indexOf(tx.skills[secondSkill] as number),
    tx[type],
  ])

  const title: Record<typeof type, string> = {
    min: `Minimum Price per ${firstSkill} / ${secondSkill}`,
    max: `Maximum Price per ${firstSkill} / ${secondSkill}`,
    count: `Number of Transactions per ${firstSkill} / ${secondSkill}`,
    avg: `Average Price per ${firstSkill} / ${secondSkill}`,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title[type]}</CardTitle>
      </CardHeader>
      <CardContent>
        <ErrorBoundary
          resetKeys={[series]}
          fallback={<div className="text-red-500">Failed to load heatmap chart.</div>}
        >
          <HeatMapChart
            className="h-80 w-full"
            xAxisLabels={firstSkillValues.map((x) => '' + x)}
            yAxisLabels={secondSkillValues.map((x) => '' + x)}
            seriesData={series}
          />
        </ErrorBoundary>
      </CardContent>
    </Card>
  )
}

function RouteComponent() {
  const isMobile = useIsMobile()
  const { code } = Route.useSearch()
  const eqCode = code

  const navigate = useNavigate({ from: Route.fullPath })
  const setEqCode = (newCode: WarEra.EquipmentCode) => {
    navigate({ search: (old: ItemMarketSearch) => ({ ...old, code: newCode }) })
  }

  const [fromDate, setFromDate] = useState<DateTime>(DateTime.now().minus({ weeks: 1 }).startOf('day'))

  const { txList, txGroups, lastTxTimeStamp, latestTxTimeStamp, tqQuery } = useEquipmentTransactions(eqCode, fromDate)

  const timeSeries = useTransactionTimeSeries(txList)

  return (
    <div className="flex flex-col gap-4 p-2">
      <h1 className="col-span-full mb-4 text-2xl font-bold">Item Market Transactions</h1>
      <div className="flex flex-row flex-wrap items-stretch gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Transaction Count: {txList.length}</div>

            <div>From: {DateTime.fromISO(lastTxTimeStamp ?? '').toLocaleString(DateTime.DATETIME_SHORT)}</div>
            <div>To: {DateTime.fromISO(latestTxTimeStamp ?? '').toLocaleString(DateTime.DATETIME_SHORT)}</div>
          </CardContent>
          <CardFooter>
            <TimeRangeSelect
              value={fromDate.toISODate() ?? ''}
              onChange={(dateStr) => setFromDate(DateTime.fromISO(dateStr ?? ''))}
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <EquipmentGridSelect value={eqCode} onChange={setEqCode} />
          </CardContent>
        </Card>

        {!weaponsCodes.includes(eqCode as WarEra.WeaponCode) && <SingleSkillChart txGroups={txGroups} />}
      </div>

      {weaponsCodes.includes(eqCode as WarEra.WeaponCode) && (
        <div className="flex flex-col justify-center gap-4">
          <DualSkillTxHeatmap txGroups={txGroups} type="min" />
          <DualSkillTxHeatmap txGroups={txGroups} type="avg" />
          <DualSkillTxHeatmap txGroups={txGroups} type="max" />
          <DualSkillTxHeatmap txGroups={txGroups} type="count" />
        </div>
      )}

      <Card className="flex-auto shrink-1">
        <CardHeader>
          <CardTitle>Price over time</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTimeSeriesChart timeSeries={timeSeries} className="h-120 w-full max-w-240" />
        </CardContent>
      </Card>
    </div>
  )
}
