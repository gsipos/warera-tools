import { useWorkOffers } from '@/api/warera-api'
import { flattenPaginatedQuery } from '@/functions/flatten-paginated-data'

export const useTopWorkOfferWage = () => {
  const workOffers = useWorkOffers(1)
  const data = flattenPaginatedQuery(workOffers)
  return data?.[0]?.wage ?? 0
}
