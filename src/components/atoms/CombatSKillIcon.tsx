import { Fragment, ReactNode } from 'react'
import ArmorIcon from './../../assets/icons/armor.svg?react'
import AttackIcon from './../../assets/icons/attack.svg?react'
import CritChanceIcon from './../../assets/icons/critChance.svg?react'
import CritDamagesIcon from './../../assets/icons/critDamages.svg?react'
import DodgeIcon from './../../assets/icons/dodge.svg?react'
import HealthIcon from './../../assets/icons/health.svg?react'
import HungerIcon from './../../assets/icons/hunger.svg?react'
import LootChangeIcon from './../../assets/icons/lootChange.svg?react'
import PrecisionIcon from './../../assets/icons/precision.svg?react'
import { WarEra } from '@/api/types'
import { cn } from '@/lib/utils'

const combarSkillIcons = {
  attack: AttackIcon,
  health: HealthIcon,
  armor: ArmorIcon,
  dodge: DodgeIcon,
  precision: PrecisionIcon,
  criticalChance: CritChanceIcon,
  criticalDamages: CritDamagesIcon,
  lootChance: LootChangeIcon,
  hunger: HungerIcon,
} as const satisfies Partial<Record<keyof WarEra.UserLite['skills'], React.FC<React.SVGProps<SVGSVGElement>>>>

export const CombarSkillIcon = ({ skill, className }: { skill: keyof typeof combarSkillIcons; className?: string }) => {
  const Icon = combarSkillIcons[skill] || Fragment

  return <Icon className={cn('inline-block size-3.5!', className)} />
}
