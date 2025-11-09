import { RankingBadge } from '@/components/molecules/RankingBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getUserCombatSkillLevels, getUserEcoSkillLevels } from '@/functions/user-utils'
import { FactoryIcon, PersonStandingIcon, PiggyBankIcon, SwordIcon, SwordsIcon, UserIcon } from 'lucide-react'
import { WarEra } from 'warera-api'
import { SimpleTooltip } from '../ui/tooltip'
import { Badge } from '../ui/badge'

export const UserCard = ({ user }: { user: WarEra.UserLite }) => {
  const ecoSkillLevels = getUserEcoSkillLevels(user)
  const combatSkillLevels = getUserCombatSkillLevels(user)
  const totalSkillLevels = ecoSkillLevels + combatSkillLevels

  if (!user) {
    return null
  }

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
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        <RankingBadge icon={<PiggyBankIcon />} rank={user.rankings?.userWealth} type="money" tooltip="Total Wealth" />
        <RankingBadge
          icon={<SwordIcon />}
          rank={user.rankings?.weeklyUserDamages}
          type="damage"
          tooltip="Weekly Damage"
        />
        <RankingBadge icon={<SwordsIcon />} rank={user.rankings?.userDamages} type="damage" tooltip="Total Damage" />
      </CardFooter>
    </Card>
  )
}
