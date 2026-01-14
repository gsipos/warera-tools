import { useTransactions } from '@/api/warera-api'
import { DateTime } from 'luxon'
import { useEffect } from 'react'

type TxQuery = ReturnType<typeof useTransactions>

export const useTimeBoxedTransactions = (
  txQuery: TxQuery,
  options: {
    from: DateTime
  } = { from: DateTime.now().startOf('day').minus({ weeks: 1 }) },
) => {
  const txList = txQuery.data?.pages.flatMap((p) => p.items) ?? []

  useEffect(() => {
    const lastTxTimeStamp = txList.at(-1)?.createdAt
    const canFetchMore = txQuery.hasNextPage && !txQuery.isFetchingNextPage
    if (!canFetchMore) return
    const isLastTxOlder = DateTime.fromISO(lastTxTimeStamp ?? '') < options.from
    if (isLastTxOlder) return

    txQuery.fetchNextPage()
  }, [txList, txQuery, options.from])

  return txList.filter((tx) => DateTime.fromISO(tx.createdAt) >= options.from)
}
