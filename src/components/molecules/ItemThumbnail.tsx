import { WarEra } from 'warera-api'
import { ItemBackground } from '../atoms/ItemBackground'
import { ItemImage } from '../atoms/ItemImage'
import { CombarSkillIcon } from '../atoms/CombatSKillIcon'

interface Props {
  item: WarEra.Item
}

export const ItemThumbnail = (props: Props) => {
  const { item } = props
  return (
    <ItemBackground code={item.code} className="pb-0.5">
      <ItemImage itemCode={item.code} className="h-auto w-full" />
      {Object.entries(item.skills).map(([skill, value]) => (
        <div key={skill} className="text-foreground/60 text-[10px] text-shadow-sm">
          <CombarSkillIcon skill={skill as keyof typeof CombarSkillIcon} className="size-3!" /> {value}
        </div>
      ))}
    </ItemBackground>
  )
}
