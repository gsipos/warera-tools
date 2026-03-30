import { useUserCompanies } from '@/api/warera-api'
import { RankingBadge } from '@/components/molecules/RankingBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatters, percentFormat } from '@/functions/number-formats'
import { getUserCombatSkillLevels, getUserEcoSkillLevels, getUserRespecDetails } from '@/functions/user-utils'
import { Link } from '@tanstack/react-router'
import {
  ActivityIcon,
  BriefcaseMedicalIcon,
  CandyIcon,
  CandyOffIcon,
  ClockIcon,
  ExternalLinkIcon,
  FactoryIcon,
  GaugeIcon,
  HeartIcon,
  PersonStandingIcon,
  PiggyBankIcon,
  SwordIcon,
  SwordsIcon,
  UserIcon,
  UserRoundCheckIcon,
  UserRoundPenIcon,
} from 'lucide-react'
import { DateTime } from 'luxon'
import { WarEra } from 'warera-api'
import { ItemImage } from '../atoms/ItemImage'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Skeleton } from '../ui/skeleton'
import { SimpleTooltip } from '../ui/tooltip'
import ArmorIcon from './../../assets/icons/armor.svg?react'
import AttackIcon from './../../assets/icons/attack.svg?react'
import CritChanceIcon from './../../assets/icons/critChance.svg?react'
import CritDamagesIcon from './../../assets/icons/critDamages.svg?react'
import DodgeIcon from './../../assets/icons/dodge.svg?react'
import HealthIcon from './../../assets/icons/health.svg?react'
import HungerIcon from './../../assets/icons/hunger.svg?react'
import LootChangeIcon from './../../assets/icons/lootChange.svg?react'
import PrecisionIcon from './../../assets/icons/precision.svg?react'
import { FavouriteButton } from '../atoms/FavouriteButton'
import { Field, FieldLabel } from '../ui/field'
import { cn } from '@/lib/utils'
import { UserCurrentEquipment } from './UserCurrentEquipment'

export const UserAvatar = ({ user, className }: { user: WarEra.UserLite; className?: string }) => {
  return (
    <Avatar className={className}>
      <AvatarImage src={user.avatarUrl ?? ''} alt={user.username} />
      <AvatarFallback>
        <UserIcon />
      </AvatarFallback>
    </Avatar>
  )
}

export const UserCompaniesProdSummary = ({ userId }: { userId: string }) => {
  const companyQuery = useUserCompanies(userId)
  if (!companyQuery) return <Skeleton className="h-4 w-full rounded-full" />

  const companies = companyQuery.data ?? []
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

export const UserCombatSummary = ({ user }: { user: WarEra.UserLite }) => {
  const attack = user.skills.attack.total
  const armor = user.skills.armor.total
  const precision = user.skills.precision.total
  const dodge = user.skills.dodge.total

  const critChace = user.skills.criticalChance.total
  const critDamage = user.skills.criticalDamages.total

  const hp = user.skills.health.total
  const lootChance = user.skills.lootChance.total
  const hunger = user.skills.hunger.total

  return (
    <div className="grid w-full grid-cols-3 gap-1 text-sm">
      <SimpleTooltip tooltip="Attack">
        <Badge variant="secondary" className="text-sm">
          <AttackIcon className="size-3.5!" />
          {attack}
        </Badge>
      </SimpleTooltip>

      <SimpleTooltip tooltip="Precision">
        <Badge variant="secondary" className="text-sm">
          <PrecisionIcon className="size-3.5!" />
          {percentFormat.format(precision / 100)}
        </Badge>
      </SimpleTooltip>

      <SimpleTooltip tooltip="Critical Chance">
        <Badge variant="secondary" className="text-sm">
          <CritChanceIcon className="size-3.5!" />
          {percentFormat.format(critChace / 100)}{' '}
        </Badge>
      </SimpleTooltip>
      <SimpleTooltip tooltip="Critical Damage">
        <Badge variant="secondary" className="text-sm">
          <CritDamagesIcon className="size-3.5!" />
          {percentFormat.format(critDamage / 100)}{' '}
        </Badge>
      </SimpleTooltip>

      <SimpleTooltip tooltip="Armor">
        <Badge variant="secondary" className="text-sm">
          <ArmorIcon className="size-3.5!" />
          {percentFormat.format(armor / 100)}{' '}
        </Badge>
      </SimpleTooltip>
      <SimpleTooltip tooltip="Dodge">
        <Badge variant="secondary" className="text-sm">
          <DodgeIcon className="size-3.5!" />
          {percentFormat.format(dodge / 100)}
        </Badge>
      </SimpleTooltip>
      <SimpleTooltip tooltip="Health Points">
        <Badge variant="secondary" className="text-sm">
          <HealthIcon className="size-3.5!" />
          {hp}
        </Badge>
      </SimpleTooltip>
      <SimpleTooltip tooltip="Loot Chance">
        <Badge variant="secondary" className="text-sm">
          <LootChangeIcon className="size-3.5!" />
          {percentFormat.format(lootChance / 100)}
        </Badge>
      </SimpleTooltip>
      <SimpleTooltip tooltip="Hunger">
        <Badge variant="secondary" className="text-sm">
          <HungerIcon className="size-3.5!" />
          {hunger}
        </Badge>
      </SimpleTooltip>
    </div>
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

const UserRespecBadge = ({ user }: { user: WarEra.UserLite }) => {
  const { canRespec, timeUntilRespec } = getUserRespecDetails(user)

  return (
    <Badge variant={canRespec ? 'default' : 'destructive'}>
      {canRespec ? <UserRoundCheckIcon /> : <UserRoundPenIcon />}
      {canRespec
        ? 'Respec available'
        : timeUntilRespec.toHuman({ maximumFractionDigits: 0, unitDisplay: 'narrow', listStyle: 'narrow' })}
    </Badge>
  )
}

const UserHealthBar = ({ user }: { user: WarEra.UserLite }) => {
  const health = user.skills.health
  const percent = (health.currentBarValue / health.total) * 100

  return (
    <div className="flex flex-row items-center gap-1 text-xs font-bold text-green-400/60">
      <HealthIcon className="size-4 shrink-0 grow-0" />
      <span className="w-12 shrink-0">HP</span>

      <Progress
        value={percent}
        id="progress-upload"
        className="h-3 shrink-1 grow-1 bg-green-900/60"
        indicatorClassName="bg-green-500/60"
      />

      <span className="w-14 shrink-0">
        {health.currentBarValue.toFixed(1)} / {health.total}
      </span>
    </div>
  )
}

const UserHungerBar = ({ user }: { user: WarEra.UserLite }) => {
  const hunger = user.skills.hunger
  const percent = (hunger.currentBarValue / hunger.total) * 100
  return (
    <div className="flex flex-row items-center gap-1 text-xs font-bold text-red-400/60">
      <HungerIcon className="size-4 shrink-0 grow-0" />
      <span className="w-12 shrink-0">Hunger</span>

      <Progress
        value={percent}
        id="progress-hunger"
        className="h-3 shrink-1 grow-1 bg-red-900/60"
        indicatorClassName="bg-red-500/60"
      />

      <span className="w-14 shrink-0">
        {hunger.currentBarValue.toFixed(1)} / {hunger.total}
      </span>
    </div>
  )
}

const UserLastSeenBadge = ({ lastConnectionAt }: { lastConnectionAt: string }) => {
  const date = DateTime.fromISO(lastConnectionAt ?? '')
  let lastSeen = date.diffNow('minutes').negate()
  const lastSeenInHours = lastSeen.as('hours')
  if (lastSeen.as('minutes') > 60) {
    lastSeen = lastSeen.shiftTo('hours')
  }
  const displayLastSeen = lastSeen.toHuman({ listStyle: 'narrow', unitDisplay: 'narrow', maximumFractionDigits: 0 })

  return (
    <SimpleTooltip tooltip={`Last seen: ${date.toLocaleString(DateTime.DATETIME_SHORT)}`}>
      <Badge
        variant="outline"
        className={cn(
          lastSeenInHours > 10 ? 'border-amber-400 text-amber-400' : '',
          lastSeenInHours > 24 ? 'border-red-600 text-red-600' : '',
        )}
      >
        <ActivityIcon />
        {displayLastSeen} ago
      </Badge>
    </SimpleTooltip>
  )
}

export type UserCardContent = 'skills' | 'companies' | 'combat' | 'misc' | 'all'

export const UserCard = ({ user, view }: { user: WarEra.UserLite; view?: UserCardContent }) => {
  const ecoSkillLevels = getUserEcoSkillLevels(user)
  const combatSkillLevels = getUserCombatSkillLevels(user)
  const totalSkillLevels = ecoSkillLevels + combatSkillLevels

  if (!user) {
    return null
  }

  const viewAll = !view || view === 'all'

  const lastConnectionAt = DateTime.fromISO(user.dates.lastConnectionAt ?? '')
  let lastSeen = lastConnectionAt.diffNow('minutes').negate()
  const lastSeenInHours = lastSeen.as('hours')
  if (lastSeen.as('minutes') > 60) {
    lastSeen = lastSeen.shiftTo('hours')
  }

  const displayLastSeen = lastSeen.toHuman({ listStyle: 'narrow', unitDisplay: 'narrow', maximumFractionDigits: 0 })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-2">
          <UserAvatar user={user} />

          {user.username}
        </CardTitle>
        <CardAction className="flex justify-between gap-2">
          <FavouriteButton type="user" id={user._id} />
          <Button variant="outline" size="icon-sm" asChild>
            <Link to={`/users/${user._id}`}>
              <ExternalLinkIcon />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      {viewAll || view === 'skills' ? (
        <>
          <CardContent className="flex flex-col gap-2">
            <div className="text-muted-foreground mb-1 text-xs uppercase">Skills</div>
            <div className="grid grid-cols-[1fr_1fr_3fr] items-center gap-x-0.5 gap-y-1">
              <SwordsIcon />
              <div>dmg</div>
              <Progress value={(combatSkillLevels / totalSkillLevels) * 100} className="w-full" />

              <FactoryIcon />
              <div>eco</div>
              <Progress value={(ecoSkillLevels / totalSkillLevels) * 100} className="w-full" />
            </div>
            <UserRespecBadge user={user} />
          </CardContent>
          <Separator className="px-2" />
        </>
      ) : null}

      {viewAll || view === 'companies' ? (
        <>
          <CardContent>
            <div className="text-muted-foreground mb-1 text-xs uppercase">Companies</div>

            <UserCompaniesProdSummary userId={user._id} />
          </CardContent>
          <Separator className="px-2" />
        </>
      ) : null}

      {viewAll || view === 'combat' ? (
        <>
          <CardContent className="flex flex-col gap-2">
            <div className="text-muted-foreground mb-1 text-xs uppercase">Combat</div>
            <UserHealthBar user={user} />
            <UserHungerBar user={user} />
            <UserCombatSummary user={user} />

            <UserCurrentEquipment userId={user._id} />

            <div className="flex flex-wrap gap-2">
              <RankingBadge
                icon={<SwordIcon />}
                rank={user.rankings?.weeklyUserDamages}
                type="damage"
                tooltip="Weekly Damage"
              />
              <RankingBadge
                icon={<SwordsIcon />}
                rank={user.rankings?.userDamages}
                type="damage"
                tooltip="Total Damage"
              />

              <SimpleTooltip tooltip="Military Rank">
                <Badge variant={'outline'}>
                  <GaugeIcon />
                  {formatters.percent.format(user.skills.attack.militaryRankPercent / 100)} ({user.militaryRank})
                </Badge>
              </SimpleTooltip>
              <UserBuffBadge user={user} />
            </div>
          </CardContent>
        </>
      ) : null}

      {viewAll ? (
        <>
          <div className="flex-grow-1" />
          <Separator className="px-2" />
        </>
      ) : null}

      {viewAll || view === 'misc' ? (
        <CardFooter className="flex-wrap gap-2">
          <SimpleTooltip tooltip={'Level'}>
            <Badge variant="outline">
              <PersonStandingIcon />
              {user.leveling.level}
            </Badge>
          </SimpleTooltip>
          <RankingBadge icon={<PiggyBankIcon />} rank={user.rankings?.userWealth} type="money" tooltip="Total Wealth" />
          <RankingBadge
            icon={<BriefcaseMedicalIcon />}
            rank={user.rankings?.userCasesOpened}
            type="count"
            tooltip="Cases Opened"
          />
          <UserLastSeenBadge lastConnectionAt={user.dates.lastConnectionAt ?? ''} />
        </CardFooter>
      ) : null}
    </Card>
  )
}
