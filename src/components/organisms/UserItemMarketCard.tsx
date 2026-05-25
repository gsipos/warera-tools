import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { ItemBackground } from '../atoms/ItemBackground'
import { ItemImage } from '../atoms/ItemImage'
import { DateTime } from 'luxon'
import { useTimeBoxedTransactions } from '@/hooks/game/use-time-boxed-transactions'
import { ItemThumbnail } from '../molecules/ItemThumbnail'
import { ScrollArea } from '../ui/scroll-area'
import { moneyFormat } from '@/functions/number-formats'
import { CircleDollarSignIcon } from 'lucide-react'

const toSum = (acc: number, val: number) => acc + val

export const UserItemMarketCard = ({ userId }: { userId: string }) => {
  const tsx = useTimeBoxedTransactions({ userId, transactionType: 'itemMarket' })

  const soldItems = tsx.filter((tx) => tx.sellerId === userId)
  const boughtItems = tsx.filter((tx) => tx.buyerId === userId)

  const soldValue = soldItems.map((tx) => tx.money).reduce(toSum, 0)
  const boughtValue = boughtItems.map((tx) => tx.money).reduce(toSum, 0)

  const lastTxTimeStamp = tsx.at(-1)?.createdAt
  const soldPerValue = soldValue / (soldItems.length || 1)

  const startOfToday = DateTime.now().startOf('day')
  const startOfYesterday = startOfToday.minus({ days: 1 })

  const soldItemsToday = soldItems.filter((tx) => DateTime.fromISO(tx.createdAt) >= DateTime.now().startOf('day'))
  const soldTodayValue = soldItemsToday.map((tx) => tx.money).reduce(toSum, 0)

  const soldItemsYesterday = soldItems
    .filter((tx) => DateTime.fromISO(tx.createdAt) >= startOfYesterday)
    .filter((tx) => DateTime.fromISO(tx.createdAt) < startOfToday)
  const soldYesterdayValue = soldItemsYesterday.map((tx) => tx.money).reduce(toSum, 0)

  const soldItemsEarlier = soldItems
    .filter((tx) => !soldItemsToday.includes(tx))
    .filter((tx) => !soldItemsYesterday.includes(tx))
  const soldEarlierValue = soldItemsEarlier.map((tx) => tx.money).reduce(toSum, 0)

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

        {soldItemsToday.length ? (
          <>
            <div className="text-muted-foreground mb-1 text-xs uppercase">
              Sold today
              <span>
                ({soldItemsToday.length},
                <CircleDollarSignIcon className="inline-block size-3!" />
                {moneyFormat.format(soldTodayValue)})
              </span>
            </div>
            <ScrollArea className="max-h-120">
              <div className="grid grid-cols-6 items-start gap-2">
                {soldItemsToday.map((tx) => (
                  <ItemThumbnail key={tx.item._id} item={tx.item} money={tx.money} />
                ))}
              </div>
            </ScrollArea>
          </>
        ) : null}

        {soldItemsYesterday.length ? (
          <>
            <div className="text-muted-foreground mb-1 text-xs uppercase">
              Sold yesterday
              <span>
                ({soldItemsYesterday.length},
                <CircleDollarSignIcon className="inline-block size-3!" />
                {moneyFormat.format(soldYesterdayValue)})
              </span>
            </div>
            <ScrollArea className="max-h-120">
              <div className="grid grid-cols-6 items-start gap-2">
                {soldItemsYesterday.map((tx) => (
                  <ItemThumbnail key={tx.item._id} item={tx.item} money={tx.money} />
                ))}
              </div>
            </ScrollArea>
          </>
        ) : null}

        {soldItemsEarlier.length ? (
          <>
            <div className="text-muted-foreground mb-1 text-xs uppercase">
              Sold earlier
              <span>
                (<span>{soldItemsEarlier.length},</span>
                <CircleDollarSignIcon className="inline-block size-3!" />
                {moneyFormat.format(soldEarlierValue)})
              </span>
            </div>
            <ScrollArea className="max-h-120">
              <div className="grid grid-cols-6 items-start gap-2">
                {soldItemsEarlier.map((tx) => (
                  <ItemThumbnail key={tx.item._id} item={tx.item} money={tx.money} />
                ))}
              </div>
            </ScrollArea>
          </>
        ) : null}

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
