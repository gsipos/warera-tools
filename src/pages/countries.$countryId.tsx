import { useAllUsersLite, useUsersByCountry } from '@/api/warera-api'
import { useCountry } from '@/hooks/game/useCountry'
import { createFileRoute } from '@tanstack/react-router'
import { CountryCard } from './countries/-organisms/CountryCard'
import { WarEra } from 'warera-api'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { AvatarFallback } from '@radix-ui/react-avatar'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FactoryIcon, SwordsIcon, UserIcon } from 'lucide-react'

export const Route = createFileRoute('/countries/$countryId')({
  component: CountryDetailPage,
})

const useCountryUsers = (countryId: string) => {
  const userIdsByCountry = useUsersByCountry(countryId)
  const userIds = userIdsByCountry.data?.pages.flatMap((page) => page.items).map((r) => r._id) || []
  const usersQueries = useAllUsersLite(userIds)
  const users = usersQueries.map((q) => q.data as WarEra.UserLite) ?? []

  return users
}

const ecoSkills: WarEra.SkillKey[] = ['companies', 'enterpreneurship', 'energy', 'production']

const toSum = (a: number, b: number) => a + b
const getUserEcoSkillLevels = (user: WarEra.UserLite) =>
  Object.entries(user.skills)
    .filter(([k]) => ecoSkills.includes(k as WarEra.SkillKey))
    .map(([, value]) => value.level)
    .reduce(toSum, 0)

const getUserCombatSkillLevels = (user: WarEra.UserLite) =>
  Object.entries(user.skills)
    .filter(([k]) => !ecoSkills.includes(k as WarEra.SkillKey))
    .map(([, value]) => value.level)
    .reduce(toSum, 0)

const usecountryUserBuildDistribution = (countryId: string) => {
  const users = useCountryUsers(countryId)

  const eco = users.map((user) => getUserEcoSkillLevels(user)).reduce(toSum, 0)
  const dmg = users.map((user) => getUserCombatSkillLevels(user)).reduce(toSum, 0)
  const total = eco + dmg

  return { eco, dmg, total }
}

const UserCard = ({ user }: { user: WarEra.UserLite }) => {
  const ecoSkillLevels = getUserEcoSkillLevels(user)
  const combatSkillLevels = getUserCombatSkillLevels(user)
  const totalSkillLevels = ecoSkillLevels + combatSkillLevels

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-1">
        <Avatar>
          <AvatarImage src={user.avatarUrl ?? ''} alt={user.username} />
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
        <CardTitle>{user.username}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-row items-center gap-0.5">
            <SwordsIcon />
            dmg
            <Progress value={(combatSkillLevels / totalSkillLevels) * 100} className="w-24" />
          </div>

          <div className="flex flex-row items-center gap-0.5">
            <FactoryIcon />
            eco
            <Progress value={(ecoSkillLevels / totalSkillLevels) * 100} className="w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const UserList = ({ countryId }: { countryId: string }) => {
  const users = useCountryUsers(countryId).toReversed()

  return (
    <div className="grid grid-cols-6 gap-6 p-2">{users.map((user) => (user ? <UserCard user={user} /> : null))}</div>
  )
}

function CountryDetailPage() {
  const { countryId } = Route.useParams()
  const country = useCountry(countryId)

  const skillDistribution = usecountryUserBuildDistribution(countryId)

  if (!country) {
    return <div>Country not found</div>
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-row items-center gap-2">
        <CountryCard country={country} />
        <Card>
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
      </div>

      <UserList countryId={countryId} />
    </div>
  )
}
