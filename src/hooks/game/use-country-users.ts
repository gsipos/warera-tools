import { useAllUsersLite, useUsersByCountry } from '@/api/warera-api'
import { flattenPaginatedQuery } from '@/functions/flatten-paginated-data'

export const useCountryUsers = (countryId: string) => {
  const userIdsByCountry = useUsersByCountry(countryId)
  const userIds = flattenPaginatedQuery(userIdsByCountry).map((u) => u._id)
  const users = useAllUsersLite(userIds).data
  return users ?? []
}
