import { useUserCurrentEquipment } from '@/api/warera-api'
import { CircleDashedIcon } from 'lucide-react'
import { ItemBackground } from '../atoms/ItemBackground'
import { ItemImage } from '../atoms/ItemImage'
import { ItemThumbnail } from '../molecules/ItemThumbnail'

const EmptySlot = () => (
  <div className="text-muted-foreground flex size-8 shrink-0 grow-0 items-center justify-center rounded-md">
    <CircleDashedIcon />
  </div>
)

export const UserCurrentEquipment = ({ userId }: { userId: string }) => {
  const currentEquipmentQuery = useUserCurrentEquipment(userId)

  const eq = currentEquipmentQuery.data

  return (
    <div className="flex flex-row items-center gap-2">
      {eq?.weapon ? <ItemThumbnail item={eq.weapon} /> : null}
      {eq?.ammo ? (
        <div className="flex flex-col items-center gap-1">
          <ItemBackground code={eq.ammo} className="pb-0.5">
            <ItemImage itemCode={eq.ammo} className="h-auto w-full" />
            <div className="text-foreground/60 flex flex-row items-center justify-center gap-0.5 text-[10px] text-shadow-sm">
              {eq.ammoQuantity}
            </div>
          </ItemBackground>
        </div>
      ) : (
        <EmptySlot />
      )}
      {eq?.helmet ? <ItemThumbnail item={eq.helmet} /> : <EmptySlot />}
      {eq?.chest ? <ItemThumbnail item={eq.chest} /> : <EmptySlot />}
      {eq?.pants ? <ItemThumbnail item={eq.pants} /> : <EmptySlot />}
      {eq?.boots ? <ItemThumbnail item={eq.boots} /> : <EmptySlot />}
      {eq?.gloves ? <ItemThumbnail item={eq.gloves} /> : <EmptySlot />}
    </div>
  )
}
