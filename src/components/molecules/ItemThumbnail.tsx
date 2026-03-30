import { WarEra } from 'warera-api'
import { ItemBackground } from '../atoms/ItemBackground'
import { ItemImage } from '../atoms/ItemImage'
import { CombarSkillIcon } from '../atoms/CombatSKillIcon'
import { CircleDollarSignIcon } from 'lucide-react'
import { formatters } from '@/functions/number-formats'
import { Progress } from '../ui/progress'

interface Props {
  item: WarEra.Item
  money?: number | undefined
}

export const ItemThumbnail = (props: Props) => {
  const { item } = props

  const isUsed = item.state < item.maxState

  return (
    <ItemBackground code={item.code} className="pb-0.5">
      <ItemImage itemCode={item.code} className="h-auto w-full" />
      {Object.entries(item.skills).map(([skill, value]) => (
        <div
          key={skill}
          className="text-foreground/60 flex flex-row items-center justify-center gap-0.5 text-[10px] text-shadow-sm"
        >
          <CombarSkillIcon skill={skill as keyof typeof CombarSkillIcon} className="size-3!" /> {value}
        </div>
      ))}
      {props.money ? (
        <div className="text-foreground/60 flex flex-row items-center justify-center gap-0.5 text-[10px] text-shadow-sm">
          <CircleDollarSignIcon className="inline-block size-3!" /> {formatters.money.format(props.money)}
        </div>
      ) : null}
      {isUsed && <Progress value={item.state} max={item.maxState} className="h-1" />}
    </ItemBackground>
  )
}
