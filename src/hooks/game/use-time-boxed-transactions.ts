import { useTransactions } from '@/api/warera-api'
import { DateTime } from 'luxon'

/**
 * Fetches transactions up to `from` date using tRPC autoPaginate with cursorEnd,
 * then filters to only include transactions from that date onwards.
 *
 * The cursorEnd on the API stops pagination when items are older than the date,
 * but may include some items slightly before the boundary in the last fetched page.
 * This filter ensures exact date boundary.
 */
export const useTimeBoxedTransactions = (
  options: Parameters<typeof useTransactions>[0],
  timeOptions: { from: DateTime } = { from: DateTime.now().startOf('day').minus({ weeks: 1 }) },
) => {
  const txQuery = useTransactions({ ...options, from: timeOptions.from })
  const txList = txQuery.data ?? []
  return txList.filter((tx) => DateTime.fromISO(tx.createdAt) >= timeOptions.from)
}
