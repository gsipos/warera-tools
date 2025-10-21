import { cva } from 'class-variance-authority'
import { ReactNode } from 'react'
import { WarEra } from 'warera-api'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatters, FormatType } from '@/functions/number-formats'
import { SimpleTooltip } from '../ui/tooltip'

const badgeVariants = cva('', {
  variants: {
    tier: {
      bronze: 'border-brown-600 text-brown-600',
      silver: 'border-gray-400 text-gray-400',
      gold: 'border-yellow-400 text-yellow-400',
      platinum: 'border-emerald-400 text-emerald-400',
      diamond: 'border-blue-400 text-blue-400',
      master: 'border-purple-600 text-purple-600',
    },
  },
})

interface Props {
  icon: ReactNode
  rank: WarEra.Rank
  type: FormatType
  tooltip?: ReactNode
}

export const RankingBadge = (props: Props) => {
  const formatter = formatters[props.type]

  const value = props.type === 'percent' ? props.rank.value / 100 : props.rank.value
  return (
    <SimpleTooltip tooltip={props.tooltip ?? `Rank #${props.rank.rank} (${props.rank.tier.toUpperCase()})`}>
      <Badge variant="outline" className={cn(badgeVariants({ tier: props.rank.tier }))}>
        {props.icon}
        {formatter.format(value ?? 0)}
      </Badge>
    </SimpleTooltip>
  )
}
