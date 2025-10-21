import { Badge } from '@/components/ui/badge'
import { moneyFormat } from '@/functions/number-formats'
import { CoinsIcon } from 'lucide-react'

export const Money = (props: { amount: number }) => {
  return (
    <Badge variant="outline">
      <CoinsIcon />
      {moneyFormat.format(props.amount ?? 0)}
    </Badge>
  )
}
