import { RankingBadge } from '@/components/molecules/RankingBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getUserCombatSkillLevels, getUserEcoSkillLevels, getUserRespecDetails } from '@/functions/user-utils'
import {
  BriefcaseMedicalIcon,
  CandyIcon,
  CandyOffIcon,
  FactoryIcon,
  GaugeIcon,
  PersonStandingIcon,
  PiggyBankIcon,
  PillIcon,
  SwordIcon,
  SwordsIcon,
  UserIcon,
  UserRoundCheckIcon,
  UserRoundPenIcon,
} from 'lucide-react'
import { WarEra } from 'warera-api'
import { SimpleTooltip } from '../ui/tooltip'
import { Badge } from '../ui/badge'
import { DateTime } from 'luxon'
import { formatters } from '@/functions/number-formats'
import { useBatchedCompanies } from '@/api/warera-api'
import { ItemImage } from '../atoms/ItemImage'
import { Suspense, use } from 'react'
import { Skeleton } from '../ui/skeleton'

export const UserAvatar = ({ user }: { user: WarEra.UserLite }) => {
  return (
    <Avatar>
      <AvatarImage src={user.avatarUrl ?? ''} alt={user.username} />
      <AvatarFallback>
        <UserIcon />
      </AvatarFallback>
    </Avatar>
  )
}

export const UserCompaniesProdSummary = ({ userId }: { userId: string }) => {
  const companyQuery = use(useBatchedCompanies(userId).promise)
  if (!companyQuery) return null

  const companies = companyQuery ?? []
  const itemsProduced = companies.map((c) => c.itemCode)

  return (
    <SimpleTooltip tooltip={`Items produced by companies`}>
      <div className="my-1 grid grid-cols-12 gap-0">
        {itemsProduced.map((itemCode, index) => (
          <ItemImage key={itemCode + index} itemCode={itemCode} />
        ))}
      </div>
    </SimpleTooltip>
  )
}

const getHumanReadableDurationUntil = (dateTime: DateTime) =>
  dateTime
    .diffNow(['hours', 'minutes'])
    .toHuman({ maximumFractionDigits: 0, unitDisplay: 'narrow', listStyle: 'narrow' })

const UserBuffBadge = ({ user }: { user: WarEra.UserLite }) => {
  const hasBuffs = !!user.buffs?.buffEndAt
  const hasDebuffs = !!user.buffs?.debuffEndAt

  const buffDateTime = user.buffs?.buffEndAt ? DateTime.fromISO(user.buffs.buffEndAt) : null
  const debuffDateTime = user.buffs?.debuffEndAt ? DateTime.fromISO(user.buffs.debuffEndAt) : null

  const timeUntilBuffEnd = buffDateTime ? getHumanReadableDurationUntil(buffDateTime) : null
  const timeUntilDebuffEnd = debuffDateTime ? getHumanReadableDurationUntil(debuffDateTime) : null

  return (
    <>
      {timeUntilBuffEnd && buffDateTime && (
        <SimpleTooltip tooltip={`Buff active until ${buffDateTime.toLocaleString(DateTime.DATETIME_MED)}`}>
          <Badge variant="default" className="text-secondary-foreground border-emerald-600 bg-emerald-600">
            <CandyIcon />
            {timeUntilBuffEnd}
          </Badge>
        </SimpleTooltip>
      )}
      {timeUntilDebuffEnd && debuffDateTime && (
        <SimpleTooltip tooltip={`Debuff active until ${debuffDateTime.toLocaleString(DateTime.DATETIME_MED)}`}>
          <Badge variant="destructive">
            <CandyOffIcon />
            {timeUntilDebuffEnd}
          </Badge>
        </SimpleTooltip>
      )}
    </>
  )
}

export const UserCard = ({ user }: { user: WarEra.UserLite }) => {
  const ecoSkillLevels = getUserEcoSkillLevels(user)
  const combatSkillLevels = getUserCombatSkillLevels(user)
  const totalSkillLevels = ecoSkillLevels + combatSkillLevels

  if (!user) {
    return null
  }

  const { canRespec, timeUntilRespec } = getUserRespecDetails(user)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-1">
        <UserAvatar user={user} />
        <CardTitle>{user.username}</CardTitle>
        <CardAction>
          <SimpleTooltip tooltip={'Level'}>
            <Badge variant="outline">
              <PersonStandingIcon />
              {user.leveling.level}
            </Badge>
          </SimpleTooltip>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_1fr_3fr] items-center gap-x-0.5 gap-y-1">
          <SwordsIcon />
          <div>dmg</div>
          <Progress value={(combatSkillLevels / totalSkillLevels) * 100} className="w-full" />

          <FactoryIcon />
          <div>eco</div>
          <Progress value={(ecoSkillLevels / totalSkillLevels) * 100} className="w-full" />
        </div>

        <Suspense fallback={<Skeleton className="rounded-fulln my-2 h-4 w-full" />}>
          <UserCompaniesProdSummary userId={user._id} />
        </Suspense>
      </CardContent>
      <UserBuffBadge user={user} />
      <CardFooter className="flex-wrap gap-2">
        <RankingBadge icon={<PiggyBankIcon />} rank={user.rankings?.userWealth} type="money" tooltip="Total Wealth" />
        <RankingBadge
          icon={<SwordIcon />}
          rank={user.rankings?.weeklyUserDamages}
          type="damage"
          tooltip="Weekly Damage"
        />
        <RankingBadge icon={<SwordsIcon />} rank={user.rankings?.userDamages} type="damage" tooltip="Total Damage" />
        <RankingBadge
          icon={<BriefcaseMedicalIcon />}
          rank={user.rankings?.userCasesOpened}
          type="count"
          tooltip="Cases Opened"
        />
        <Badge variant={canRespec ? 'default' : 'destructive'}>
          {canRespec ? <UserRoundCheckIcon /> : <UserRoundPenIcon />}
          {canRespec
            ? 'Respec available'
            : timeUntilRespec.toHuman({ maximumFractionDigits: 0, unitDisplay: 'narrow', listStyle: 'narrow' })}
        </Badge>

        <SimpleTooltip tooltip="Military Rank">
          <Badge variant={'outline'}>
            <GaugeIcon />
            {formatters.percent.format(user.skills.attack.militaryRankPercent / 100)} ({user.militaryRank})
          </Badge>
        </SimpleTooltip>
      </CardFooter>
    </Card>
  )
}
