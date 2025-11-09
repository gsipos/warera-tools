import { useAllUsersLite, useUsersByCountry } from '@/api/warera-api'
import { UserCard } from '@/components/organisms/UserCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getUserCombatSkillLevels, getUserEcoSkillLevels } from '@/functions/user-utils'
import { useCountry } from '@/hooks/game/useCountry'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronLeftIcon, FactoryIcon, SwordsIcon } from 'lucide-react'
import { CountryCard } from './countries/-organisms/CountryCard'
import { useMemo } from 'react'
import { WarEra } from 'warera-api'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/countries/$countryId')({
  component: CountryDetailPage,
})

const useCountryUsers = (countryId: string) => {
  const userIdsByCountry = useUsersByCountry(countryId)
  const userIds = userIdsByCountry.data?.pages.flatMap((page) => page.items).map((r) => r._id) || []
  const users = useAllUsersLite(userIds).data
  return users
}

const toSum = (a: number, b: number) => a + b
const usecountryUserBuildDistribution = (users: WarEra.UserLite[]) => {
  return useMemo(() => {
    const eco = users.map((user) => getUserEcoSkillLevels(user)).reduce(toSum, 0)
    const dmg = users.map((user) => getUserCombatSkillLevels(user)).reduce(toSum, 0)
    const total = eco + dmg

    return { eco, dmg, total }
  }, [users])
}

const CountryStatsCard = ({ users }: { users: WarEra.UserLite[] }) => {
  const skillDistribution = usecountryUserBuildDistribution(users)
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
  const users = useCountryUsers(countryId).toReversed()

  if (!country) {
    return <div>Country not found</div>
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button variant="link" asChild className="self-start">
        <Link to="/countries">
          <ChevronLeftIcon />
          Back to Countries
        </Link>
      </Button>

      <div className="flex flex-row gap-4">
        <CountryCard country={country} />
        <CountryStatsCard users={users} />
      </div>

      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 p-2">
        {users.map((user) => (user ? <UserCard user={user} key={user._id} /> : null))}
      </div>
    </div>
  )
}
