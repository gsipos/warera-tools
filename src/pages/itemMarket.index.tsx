import { useTransactions } from '@/api/warera-api'
import { itemCodes, weaponsCodes } from '@/api/warera-api-schema'
import { EquipmentGridSelect } from '@/components/molecules/EquipmentGridSelect'
import { EquipmentSelect } from '@/components/molecules/EquipmentSelect'
import { HeatMapChart } from '@/components/organisms/HeatMapChart'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createFileRoute } from '@tanstack/react-router'
import { DateTime } from 'luxon'
import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { WarEra } from 'warera-api'

export const Route = createFileRoute('/itemMarket/')({
  component: RouteComponent,
})

const skillsToString = (skills: Record<string, number>) => {
  return Object.entries(skills)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}

interface AggregatedTx {
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

const SingleSkillTxHeatmap = ({
  txGroups,
  type,
}: {
  txGroups: AggregatedTx[]
  type: 'min' | 'max' | 'count' | 'avg'
}) => {
  const skillNames = Object.keys(txGroups.at(0)?.skills ?? {}) || []
  const firstSkill = skillNames[0] || ''
  const skillValues = [...new Set(txGroups.map((tx) => tx.skills[firstSkill]))].toSorted()

  const series: [number, number, number][] = txGroups.map((tx) => [
    skillValues.indexOf(tx.skills[firstSkill]),
    0,
    tx[type],
  ])

  const title: Record<typeof type, string> = {
    min: `Minimum Price per ${firstSkill}`,
    max: `Maximum Price per ${firstSkill}`,
    count: `Number of Transactions per ${firstSkill}`,
    avg: `Average Price per ${firstSkill}`,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title[type]}</CardTitle>
      </CardHeader>
      <CardContent>
        <HeatMapChart
          className="h-40 w-140"
          xAxisLabels={skillValues.map((x) => '' + x)}
          yAxisLabels={[firstSkill]}
          seriesData={series}
        />
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
        <HeatMapChart
          className="h-80 w-360"
          xAxisLabels={firstSkillValues.map((x) => '' + x)}
          yAxisLabels={secondSkillValues.map((x) => '' + x)}
          seriesData={series}
        />
      </CardContent>
    </Card>
  )
}

function RouteComponent() {
  const [eqCode, setEqCode] = useState<WarEra.EquipmentCode>('gun')

  const tqQuery = useTransactions({
    limit: 50,
    transactionType: 'itemMarket',
    itemCode: eqCode,
  })

  const txList = tqQuery.data?.pages.flatMap((p) => p.items) ?? []

  const txGroups = useAggregatedTransactions(txList)

  const lastTxTimeStamp = txList.at(-1)?.createdAt
  const latestTxTimeStamp = txList.at(0)?.createdAt

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
      </div>

      {weaponsCodes.includes(eqCode as WarEra.WeaponCode) ? (
        <div className="flex flex-col justify-center gap-4">
          <DualSkillTxHeatmap txGroups={txGroups} type="min" />
          <DualSkillTxHeatmap txGroups={txGroups} type="avg" />
          <DualSkillTxHeatmap txGroups={txGroups} type="max" />
          <DualSkillTxHeatmap txGroups={txGroups} type="count" />
        </div>
      ) : (
        <div className="flex flex-row flex-wrap justify-start gap-4">
          <SingleSkillTxHeatmap txGroups={txGroups} type="min" />
          <SingleSkillTxHeatmap txGroups={txGroups} type="avg" />
          <SingleSkillTxHeatmap txGroups={txGroups} type="max" />
          <SingleSkillTxHeatmap txGroups={txGroups} type="count" />
        </div>
      )}
    </div>
  )
}
