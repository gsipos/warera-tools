import { useAllUsersLite, useUsersByCountry } from '@/api/warera-api'
import { UserCard } from '@/components/organisms/UserCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getUserCombatSkillLevels, getUserEcoSkillLevels } from '@/functions/user-utils'
import { useCountry } from '@/hooks/game/useCountry'
import { createFileRoute } from '@tanstack/react-router'
import { FactoryIcon, SwordsIcon } from 'lucide-react'
import { WarEra } from 'warera-api'
import { CountryCard } from './countries/-organisms/CountryCard'
import { useDeferredValue } from 'react'

export const Route = createFileRoute('/countries/$countryId')({
  component: CountryDetailPage,
})

const useCountryUsers = (countryId: string) => {
  const userIdsByCountry = useUsersByCountry(countryId)
  const userIds = useDeferredValue(userIdsByCountry.data?.pages.flatMap((page) => page.items).map((r) => r._id) || [])
  const usersQueries = useAllUsersLite(userIds)
  const users = usersQueries.map((q) => q.data as WarEra.UserLite) ?? []

  return users
}

const toSum = (a: number, b: number) => a + b
const usecountryUserBuildDistribution = (countryId: string) => {
  const users = useCountryUsers(countryId)

  const eco = users.map((user) => getUserEcoSkillLevels(user)).reduce(toSum, 0)
  const dmg = users.map((user) => getUserCombatSkillLevels(user)).reduce(toSum, 0)
  const total = eco + dmg

  return { eco, dmg, total }
}

const UserList = ({ countryId }: { countryId: string }) => {
  const users = useCountryUsers(countryId).toReversed()

  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 p-2">
      {users.map((user) => (user ? <UserCard user={user} key={user._id} /> : null))}
    </div>
  )
}

const CountryStatsCard = ({ countryId }: { countryId: string }) => {
  const skillDistribution = usecountryUserBuildDistribution(countryId)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Country stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-1">
            <FactoryIcon />
            eco
            <Progress value={(skillDistribution.eco / skillDistribution.total) * 100} className="w-48" />
          </div>
          <div className="flex flex-row items-center gap-1">
            <SwordsIcon />
            dmg
            <Progress value={(skillDistribution.dmg / skillDistribution.total) * 100} className="w-48" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CountryDetailPage() {
  const { countryId } = Route.useParams()
  const country = useCountry(countryId)

  if (!country) {
    return <div>Country not found</div>
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-row gap-4">
        <CountryCard country={country} />
        <CountryStatsCard countryId={countryId} />
      </div>

      <UserList countryId={countryId} />
    </div>
  )
}
