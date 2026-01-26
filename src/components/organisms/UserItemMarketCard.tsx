import { useTransactions } from '@/api/warera-api'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { ItemBackground } from '../atoms/ItemBackground'
import { ItemImage } from '../atoms/ItemImage'
import { DateTime } from 'luxon'
import { useTimeBoxedTransactions } from '@/hooks/game/use-time-boxed-transactions'
import { ItemThumbnail } from '../molecules/ItemThumbnail'
import { ScrollArea } from '../ui/scroll-area'

export const UserItemMarketCard = ({ userId }: { userId: string }) => {
  const itemMarketQuery = useTransactions({
    userId: userId,
    transactionType: 'itemMarket',
  })
  const tsx = useTimeBoxedTransactions(itemMarketQuery)

  const soldItems = tsx.filter((tx) => tx.sellerId === userId)
  const boughtItems = tsx.filter((tx) => tx.buyerId === userId)

  const soldValue = soldItems.reduce((acc, tx) => acc + tx.money, 0)
  const boughtValue = boughtItems.reduce((acc, tx) => acc + tx.money, 0)

  const lastTxTimeStamp = tsx.at(-1)?.createdAt
  const soldPerValue = soldValue / (soldItems.length || 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Market</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>Since {DateTime.fromISO(lastTxTimeStamp ?? '').toLocaleString(DateTime.DATETIME_SHORT)}</div>
        <div>
          Items Sold: {soldItems.length} for {soldValue.toLocaleString()}{' '}
          <span className="text-muted-foreground">({soldPerValue.toFixed(1)} avg)</span>
        </div>
        <div>
          Items Bought: {boughtItems.length} for {boughtValue.toLocaleString()}{' '}
        </div>

        <Separator />
        <div className="text-muted-foreground mb-1 text-xs uppercase">Sold Items</div>
        <ScrollArea className="max-h-120">
          <div className="grid grid-cols-6 items-start gap-2">
            {soldItems.map((tx) => (
              <ItemThumbnail key={tx.item._id} item={tx.item} money={tx.money} />
            ))}
          </div>
        </ScrollArea>
        <Separator />
        <div className="text-muted-foreground mb-1 text-xs uppercase">Bought Items</div>
        <ScrollArea className="max-h-120">
          <div className="grid grid-cols-6 items-start gap-2">
            {boughtItems.map((tx) => (
              <ItemThumbnail key={tx.item._id} item={tx.item} money={tx.money} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}
