import { useDeferredValue } from 'react'
import { useCountryUsers } from './use-country-users'

export const useCountryUsersLevelAggregated = (countryId: string) => {
  const users = useCountryUsers(countryId)
  const deferredUsers = useDeferredValue(users, [])

  const levels = deferredUsers.map((u) => u.leveling.level)
  const maxLevel = levels.length > 0 ? Math.max(...levels) : 0

  const levelData: { level: number; count: number }[] = []
  for (let level = 1; level <= maxLevel; level++) {
    const count = deferredUsers.filter((u) => u.leveling.level === level).length
    levelData.push({ level, count })
  }

  return levelData
}
