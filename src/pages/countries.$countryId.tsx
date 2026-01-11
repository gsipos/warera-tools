import { useWorkOffersByCompanies } from '@/api/warera-api'
import { UserCard } from '@/components/organisms/UserCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { getUserCombatSkillLevels, getUserEcoSkillLevels, getUserRespecDetails } from '@/functions/user-utils'
import { useCompaniesByUsers } from '@/hooks/game/use-companies-by-users'
import { useCountryUsers } from '@/hooks/game/use-country-users'
import { useCountry } from '@/hooks/game/useCountry'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  CandyIcon,
  CandyOffIcon,
  ChevronLeftIcon,
  FactoryIcon,
  PillIcon,
  SwordsIcon,
  UserRoundPenIcon,
} from 'lucide-react'
import { ReactNode, useMemo } from 'react'
import { WarEra } from 'warera-api'
import { CountryCard } from './countries/-organisms/CountryCard'
import { CountryUserLevelChart } from '@/components/organisms/CountryUserLevelChart'
import { C } from 'node_modules/@tanstack/query-core/build/modern/hydration-CeGZtiZv'

export const Route = createFileRoute('/countries/$countryId')({
  component: CountryDetailPage,
})

const toSum = (a: number, b: number) => a + b
const usecountryUserBuildDistribution = (users: WarEra.UserLite[]) => {
  return useMemo(() => {
    const eco = users.map((user) => getUserEcoSkillLevels(user)).reduce(toSum, 0)
    const dmg = users.map((user) => getUserCombatSkillLevels(user)).reduce(toSum, 0)
    const total = eco + dmg

    return { eco, dmg, total }
  }, [users])
}

const CountryStatItem = (props: { icon: ReactNode; label: ReactNode; value: number; total: number }) => {
  const Icon = props.icon

  return (
    <div className="flex flex-row items-center gap-1">
      {props.icon}
      {props.label}
      <Progress value={(props.value / props.total) * 100} className="w-48" />
    </div>
  )
}

const CountryStatsCard = ({ users }: { users: WarEra.UserLite[] }) => {
  const skillDistribution = usecountryUserBuildDistribution(users)

  const userCount = users.length
  const canRespec = users.filter((user) => getUserRespecDetails(user).canRespec).length

  const canPill = users.filter((u) => !u.buffs).length
  const buffed = users.filter((u) => !!u.buffs?.buffEndAt).length
  const debuffed = users.filter((u) => !!u.buffs?.debuffEndAt).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Country stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <CountryStatItem
            icon={<FactoryIcon />}
            label="eco"
            value={skillDistribution.eco}
            total={skillDistribution.total}
          />
          <CountryStatItem
            icon={<SwordsIcon />}
            label="dmg"
            value={skillDistribution.dmg}
            total={skillDistribution.total}
          />
          <CountryStatItem icon={<UserRoundPenIcon />} label="respec" value={canRespec} total={userCount} />
          <Separator />
          <CountryStatItem icon={<CandyIcon />} label="buffed" value={buffed} total={userCount} />
          <CountryStatItem icon={<CandyOffIcon />} label="debuffed" value={debuffed} total={userCount} />
          <CountryStatItem icon={<PillIcon />} label="can pill" value={canPill} total={userCount} />
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
        <CountryUserLevelChart countryId={countryId} />
      </div>

      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 p-2">
        {users.map((user) => (user ? <UserCard user={user} key={user._id} /> : null))}
      </div>

      <Separator />
    </div>
  )
}
