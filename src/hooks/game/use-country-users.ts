import { useAllUsersLite, useUsersByCountry } from '@/api/warera-api'

export const useCountryUsers = (countryId: string) => {
  const userIdsByCountry = useUsersByCountry(countryId)
  const userIds = userIdsByCountry.data?.pages.flatMap((page) => page.items).map((r) => r._id) || []
  const users = useAllUsersLite(userIds).data
  return users
}
