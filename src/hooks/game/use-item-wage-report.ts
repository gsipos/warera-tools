import { useTradingTopOrders } from '@/api/warera-api'
import { WarEra } from 'warera-api'

export const useItemSellPrice = (item: WarEra.ItemCode) => {
  const topOrdersQuery = useTradingTopOrders(item)
  const sellOrders = topOrdersQuery.data?.sellOrders || []
  return sellOrders[0]?.price || 0
}
