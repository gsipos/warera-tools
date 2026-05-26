import { cn } from '@/lib/utils'
import { WarEra } from '@/api/types'

interface Props {
  itemCode: string
  className?: string
}

export const ItemImage = (props: Props) => {
  const url = `/images/items/${props.itemCode}.png`

  return <img src={url} alt={props.itemCode} className={cn('h-6 w-6 object-contain', props.className)} />
}
