import { useTransactions } from '@/api/warera-api'
import { DateTime, Interval } from 'luxon'
import { useEffect } from 'react'
import { WarEra } from 'warera-api'

export interface AggregatedTx {
  skillId: string
  skills: Record<string, number>
  money: number[]
  min: number
  max: number
  count: number
  avg: number
}

const skillsToString = (skills: Record<string, number>) => {
  return Object.entries(skills)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}

export const useAggregatedTransactions = (txList: WarEra.Transaction[]) => {
  const txGroups: AggregatedTx[] = []

  txList.forEach((tx) => {
    if (tx.item.state !== tx.item.maxState) return // Exclude used items

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
      group.avg = Math.round(group.money.reduce((a, b) => a + b, 0) / (group.money.length / 10)) / 10
    }
  })

  txGroups.sort((a, b) => a.skillId.localeCompare(b.skillId))

  return txGroups
}

const useTransactionsFromDate = (eqCode: WarEra.EquipmentCode, fromDate: DateTime) => {
  const tqQuery = useTransactions({
    limit: 50,
    transactionType: 'itemMarket',
    itemCode: eqCode,
  })
  const txList = (tqQuery.data?.pages.flatMap((p) => p.items) ?? []).filter((tx) => tx.item.state === tx.item.maxState)

  useEffect(() => {
    const canFetchMore = tqQuery.hasNextPage && !tqQuery.isFetchingNextPage
    if (!canFetchMore) return
    const isLastTxOlder = DateTime.fromISO(txList.at(-1)?.createdAt ?? '') < fromDate
    if (isLastTxOlder) return

    tqQuery.fetchNextPage()
  })

  const filteredTxList = txList.filter((tx) => DateTime.fromISO(tx.createdAt ?? '') >= fromDate)
  const lastTxTimeStamp = filteredTxList.at(-1)?.createdAt

  return { tqQuery, txList: filteredTxList, lastTxTimeStamp }
}

export const useEquipmentTransactions = (eqCode: WarEra.EquipmentCode, fromDate?: DateTime) => {
  const { tqQuery, txList, lastTxTimeStamp } = useTransactionsFromDate(
    eqCode,
    fromDate ?? DateTime.now().minus({ weeks: 2 }),
  )
  const txGroups = useAggregatedTransactions(txList)
  const latestTxTimeStamp = txList.at(0)?.createdAt
  return { txList, txGroups, lastTxTimeStamp, latestTxTimeStamp, tqQuery }
}

export const useItemMarketPrice = (item: WarEra.Item, fromDate?: DateTime) => {
  const { txList } = useTransactionsFromDate(item.code, fromDate ?? DateTime.now().minus({ weeks: 2 }))

  const itemSkillId = skillsToString(item.skills)
  const filteredTxList = txList.filter(
    (tx) => tx.item.state === item.maxState && skillsToString(tx.item.skills) === itemSkillId,
  )
  const txGroup = useAggregatedTransactions(filteredTxList).find((g) => g.skillId === itemSkillId)

  return txGroup
}

export interface DailyTransactionSummary {
  date: string
  transactions: WarEra.Transaction[]
  count: number
  min: number
  max: number
  avg: number
}

export const useTransactionTimeSeries = (txList: WarEra.Transaction[]): DailyTransactionSummary[] => {
  const lastTxTimeStamp = DateTime.fromISO(txList.at(-1)?.createdAt ?? '').startOf('day')
  const latestTxTimeStamp = DateTime.fromISO(txList.at(0)?.createdAt ?? '').endOf('day')
  const interval = Interval.fromDateTimes(lastTxTimeStamp, latestTxTimeStamp)
  const days = interval.splitBy({ day: 1 }).map((d) => d.start) as DateTime[]

  const dailyTransactions = days.map((d) => {
    const txs = txList.filter((tx) => DateTime.fromISO(tx.createdAt ?? '').hasSame(d, 'day'))
    return {
      date: d.toISODate() as string,
      transactions: txs,
      count: txs.length,
      min: txs.length > 0 ? Math.min(...txs.map((tx) => tx.money)) : 0,
      max: txs.length > 0 ? Math.max(...txs.map((tx) => tx.money)) : 0,
      avg: txs.length > 0 ? Math.round(txs.map((tx) => tx.money).reduce((a, b) => a + b, 0) / txs.length) : 0,
    }
  })

  return dailyTransactions
}
