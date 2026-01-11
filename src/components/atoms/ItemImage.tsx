import { cn } from '@/lib/utils'
import { WarEra } from 'warera-api'

const itemImages = Object.values(
  import.meta.glob('../../assets/images/items/*.png', { eager: true, query: '?url', import: 'default' }),
) as string[]

interface Props {
  itemCode: WarEra.ItemCode | WarEra.EquipmentCode
  className?: string
}

export const ItemImage = (props: Props) => {
  const url = itemImages.find((url) => url.includes(`/${props.itemCode}-`) || url.includes(`${props.itemCode}.png`))
    if (!url) {
        console.error('Item image not found for itemCode:', props.itemCode, itemImages);
        return null
    }

  return <img src={url} alt={props.itemCode} className={cn('h-6 w-6 object-contain', props.className)} />
}
