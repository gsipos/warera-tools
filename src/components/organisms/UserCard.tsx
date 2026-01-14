import { useBatchedCompanies } from '@/api/warera-api'
import { RankingBadge } from '@/components/molecules/RankingBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatters, percentFormat } from '@/functions/number-formats'
import { getUserCombatSkillLevels, getUserEcoSkillLevels, getUserRespecDetails } from '@/functions/user-utils'
import {
  BriefcaseMedicalIcon,
  CandyIcon,
  CandyOffIcon,
  ExternalLinkIcon,
  FactoryIcon,
  GaugeIcon,
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
import { Link } from '@tanstack/react-router'

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
  const companyQuery = useBatchedCompanies(userId)
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
    <div className="grid w-full grid-cols-4 gap-1">
      <SimpleTooltip tooltip="Attack">
        <Badge variant="secondary">
          <AttackIcon className="size-3.5!" />
          {attack}
        </Badge>
      </SimpleTooltip>

      <SimpleTooltip tooltip="Precision">
        <Badge variant="secondary">
          <PrecisionIcon className="size-3.5!" />
          {percentFormat.format(precision / 100)}
        </Badge>
      </SimpleTooltip>

      <SimpleTooltip tooltip="Critical Chance">
        <Badge variant="secondary">
          <CritChanceIcon className="size-3.5!" />
          {percentFormat.format(critChace / 100)}{' '}
        </Badge>
      </SimpleTooltip>
      <SimpleTooltip tooltip="Critical Damage">
        <Badge variant="secondary">
          <CritDamagesIcon className="size-3.5!" />
          {percentFormat.format(critDamage / 100)}{' '}
        </Badge>
      </SimpleTooltip>

      <SimpleTooltip tooltip="Armor">
        <Badge variant="secondary">
          <ArmorIcon className="size-3.5!" />
          {percentFormat.format(armor / 100)}{' '}
        </Badge>
      </SimpleTooltip>
      <SimpleTooltip tooltip="Dodge">
        <Badge variant="secondary">
          <DodgeIcon className="size-3.5!" />
          {percentFormat.format(dodge / 100)}
        </Badge>
      </SimpleTooltip>
      <SimpleTooltip tooltip="Health Points">
        <Badge variant="secondary">
          <HealthIcon className="size-3.5!" />
          {hp}
        </Badge>
      </SimpleTooltip>
      <SimpleTooltip tooltip="Loot Chance">
        <Badge variant="secondary">
          <LootChangeIcon className="size-3.5!" />
          {percentFormat.format(lootChance / 100)}
        </Badge>
      </SimpleTooltip>
      <SimpleTooltip tooltip="Hunger">
        <Badge variant="secondary">
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

export const UserCard = ({ user }: { user: WarEra.UserLite }) => {
  const ecoSkillLevels = getUserEcoSkillLevels(user)
  const combatSkillLevels = getUserCombatSkillLevels(user)
  const totalSkillLevels = ecoSkillLevels + combatSkillLevels

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-2">
          <UserAvatar user={user} />

          {user.username}
        </CardTitle>
        <CardAction className="flex justify-between gap-2">
          <Button variant="outline" size="icon-sm" asChild>
            <Link to={`/users/${user._id}`}>
              <ExternalLinkIcon />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
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

      <CardContent>
        <div className="text-muted-foreground mb-1 text-xs uppercase">Companies</div>

        <UserCompaniesProdSummary userId={user._id} />
      </CardContent>

      <Separator className="px-2" />

      <CardContent className="flex flex-col gap-2">
        <div className="text-muted-foreground mb-1 text-xs uppercase">Combat</div>
        <UserCombatSummary user={user} />
        <div className="flex flex-wrap gap-2">
          <RankingBadge
            icon={<SwordIcon />}
            rank={user.rankings?.weeklyUserDamages}
            type="damage"
            tooltip="Weekly Damage"
          />
          <RankingBadge icon={<SwordsIcon />} rank={user.rankings?.userDamages} type="damage" tooltip="Total Damage" />

          <SimpleTooltip tooltip="Military Rank">
            <Badge variant={'outline'}>
              <GaugeIcon />
              {formatters.percent.format(user.skills.attack.militaryRankPercent / 100)} ({user.militaryRank})
            </Badge>
          </SimpleTooltip>
          <UserBuffBadge user={user} />
        </div>
      </CardContent>

      <div className="flex-grow-1" />

      <Separator className="px-2" />

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
      </CardFooter>
    </Card>
  )
}
