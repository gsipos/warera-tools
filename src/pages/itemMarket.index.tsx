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

const itemMarketSearchSchema = z.object({
  code: fallback(z.enum(equipmentCodes).default('gun'), 'gun'),
})

type ItemMarketSearch = z.infer<typeof itemMarketSearchSchema>

export const Route = createFileRoute('/itemMarket/')({
  component: RouteComponent,
  validateSearch: zodValidator(itemMarketSearchSchema),
})

const skillsToString = (skills: Record<string, number>) => {
  return Object.entries(skills)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}

export interface AggregatedTx {
  skillId: string
  skills: Record<string, number>
  money: number[]
  min: number
  max: number
  count: number
  avg: number
}

const useAggregatedTransactions = (txList: WarEra.Transaction[]) => {
  const txGroups: AggregatedTx[] = []

  txList.forEach((tx) => {
    const skillId = skillsToString(tx.item.skills)
    let group = txGroups.find((g) => g.skillId === skillId)
    if (!group) {
      group = {
        skillId,
        skills: tx.item.skills,
        money: [tx.money],
        min: tx.money,
        max: tx.money,
        count: 1,
        avg: tx.money,
      }
      txGroups.push(group)
    } else {
      group.money.push(tx.money)
      if (tx.money < group.min) group.min = tx.money
      if (tx.money > group.max) group.max = tx.money
      group.count += 1
      group.avg = Math.round(group.money.reduce((a, b) => a + b, 0) / group.money.length)
    }
  })

  txGroups.sort((a, b) => a.skillId.localeCompare(b.skillId))

  return txGroups
}

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
    <Card>
      <CardHeader>
        <CardTitle>Prices by {firstSkill} min/avg/max</CardTitle>
      </CardHeader>
      <CardContent>
        <ErrorBoundary
          resetKeys={[dataSet]}
          fallback={<div className="text-red-500">Failed to load heatmap chart.</div>}
        >
          <PriceDistributionChart className="h-120 w-140" dataSet={dataSet} />
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
            className="h-80 w-800"
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
  const { code } = Route.useSearch()
  const eqCode = code

  const navigate = useNavigate({ from: Route.fullPath })
  const setEqCode = (newCode: WarEra.EquipmentCode) => {
    navigate({ search: (old: ItemMarketSearch) => ({ ...old, code: newCode }) })
  }

  const tqQuery = useTransactions({
    limit: 50,
    transactionType: 'itemMarket',
    itemCode: eqCode,
  })

  const txList = tqQuery.data?.pages.flatMap((p) => p.items) ?? []

  const txGroups = useAggregatedTransactions(txList)

  const lastTxTimeStamp = txList.at(-1)?.createdAt
  const latestTxTimeStamp = txList.at(0)?.createdAt

  useEffect(() => {
    const canFetchMore = tqQuery.hasNextPage && !tqQuery.isFetchingNextPage
    if (!canFetchMore) return
    const last2Weeks = DateTime.now().minus({ weeks: 2 })
    const isLastTxOlder = DateTime.fromISO(lastTxTimeStamp ?? '') < last2Weeks
    if (isLastTxOlder) return

    tqQuery.fetchNextPage()
  })

  return (
    <div className="flex flex-col gap-4 p-2">
      <h1 className="col-span-full mb-4 text-2xl font-bold">Item Market Transactions</h1>
      <div className="flex flex-row items-stretch gap-8">
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
            <Button
              onClick={() => tqQuery.fetchNextPage()}
              disabled={!tqQuery.hasNextPage || tqQuery.isFetchingNextPage}
            >
              Load more
            </Button>
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
    </div>
  )
}
