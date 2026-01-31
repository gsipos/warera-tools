import { useTransactions } from '@/api/warera-api'
import { DateTime } from 'luxon'
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
      group.avg = Math.round(group.money.reduce((a, b) => a + b, 0) / group.money.length)
    }
  })

  txGroups.sort((a, b) => a.skillId.localeCompare(b.skillId))

  return txGroups
}

const useTransactionsInLast2Weeks = (eqCode: WarEra.EquipmentCode) => {
  const tqQuery = useTransactions({
    limit: 50,
    transactionType: 'itemMarket',
    itemCode: eqCode,
  })
  const txList = (tqQuery.data?.pages.flatMap((p) => p.items) ?? []).filter((tx) => tx.item.state === tx.item.maxState)
  const lastTxTimeStamp = txList.at(-1)?.createdAt

  useEffect(() => {
    const canFetchMore = tqQuery.hasNextPage && !tqQuery.isFetchingNextPage
    if (!canFetchMore) return
    const last2Weeks = DateTime.now().minus({ weeks: 2 })
    const isLastTxOlder = DateTime.fromISO(lastTxTimeStamp ?? '') < last2Weeks
    if (isLastTxOlder) return

    tqQuery.fetchNextPage()
  })

  return { tqQuery, txList, lastTxTimeStamp }
}

export const useEquipmentTransactions = (eqCode: WarEra.EquipmentCode) => {
  const { tqQuery, txList, lastTxTimeStamp } = useTransactionsInLast2Weeks(eqCode)

  const txGroups = useAggregatedTransactions(txList)

  const latestTxTimeStamp = txList.at(0)?.createdAt

  useEffect(() => {
    const canFetchMore = tqQuery.hasNextPage && !tqQuery.isFetchingNextPage
    if (!canFetchMore) return
    const last2Weeks = DateTime.now().minus({ weeks: 2 })
    const isLastTxOlder = DateTime.fromISO(lastTxTimeStamp ?? '') < last2Weeks
    if (isLastTxOlder) return

    tqQuery.fetchNextPage()
  })

  return { txList, txGroups, lastTxTimeStamp, latestTxTimeStamp, tqQuery }
}

export const useItemMarketPrice = (item: WarEra.Item) => {
  const { txList } = useTransactionsInLast2Weeks(item.code)

  const itemSkillId = skillsToString(item.skills)
  const filteredTxList = txList.filter(
    (tx) => tx.item.state === item.maxState && skillsToString(tx.item.skills) === itemSkillId,
  )
  const txGroup = useAggregatedTransactions(filteredTxList).find((g) => g.skillId === itemSkillId)

  return txGroup
}
