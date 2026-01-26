import { useTransactions } from '@/api/warera-api'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { DateTime } from 'luxon'
import { WarEra } from 'warera-api'
import { Separator } from '@radix-ui/react-separator'
import { ItemBackground } from '../atoms/ItemBackground'
import { ItemImage } from '../atoms/ItemImage'
import { moneyFormat } from '@/functions/number-formats'
import { useTimeBoxedTransactions } from '@/hooks/game/use-time-boxed-transactions'

interface AggregatedTx {
  itemCode: WarEra.ItemCode
  amount: number
  money: number
  txs: WarEra.Transaction[]
}

const toSum = (acc: number, val: number) => acc + val

const aggregateTransactionsByItem = (txList: WarEra.Transaction[]): AggregatedTx[] => {
  const itemCodes = [...new Set(txList.map((tx) => tx.itemCode))]
  return itemCodes.map((code) => {
    const txs = txList.filter((tx) => tx.itemCode === code)
    const amount: number = txs.map((tx) => tx.quantity).reduce(toSum, 0)
    const money: number = txs.map((tx) => tx.money).reduce(toSum, 0)
    return {
      itemCode: code,
      amount,
      money,
      txs,
    }
  })
}

export const UserTradingCard = ({ userId }: { userId: string }) => {
  const tradeQuery = useTransactions({
    userId: userId,
    transactionType: 'trading',
  })
  const tsx = useTimeBoxedTransactions(tradeQuery)

  const soldItems = tsx.filter((tx) => tx.sellerId === userId)
  const boughtItems = tsx.filter((tx) => tx.buyerId === userId)

  const soldValue = soldItems.reduce((acc, tx) => acc + tx.money, 0)
  const boughtValue = boughtItems.reduce((acc, tx) => acc + tx.money, 0)

  const lastTxTimeStamp = tsx.at(-1)?.createdAt

  const buys = aggregateTransactionsByItem(boughtItems)
  const sells = aggregateTransactionsByItem(soldItems)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Market</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>Since {DateTime.fromISO(lastTxTimeStamp ?? '').toLocaleString(DateTime.DATETIME_SHORT)}</div>
        <div>Items Sold for {moneyFormat.format(soldValue ?? 0)}</div>
        <div>Items Bought for {moneyFormat.format(boughtValue ?? 0)}</div>

        <Separator />
        <div className="text-muted-foreground mb-1 text-xs uppercase">Bought Items</div>
        {buys.map((aggTx, idx) => (
          <div className="flex flex-row gap-2">
            {aggTx.amount}x
            <ItemBackground code={aggTx.itemCode}>
              <ItemImage itemCode={aggTx.itemCode} className="size-6" />
            </ItemBackground>
            <span className="capitalize">{aggTx.itemCode}</span>
            for {moneyFormat.format(aggTx.money ?? 0)}
          </div>
        ))}

        <Separator />
        <div className="text-muted-foreground mb-1 text-xs uppercase">Sold Items</div>
        {sells.map((aggTx, idx) => (
          <div className="flex flex-row gap-2" key={aggTx.itemCode}>
            {aggTx.amount}x
            <ItemBackground code={aggTx.itemCode}>
              <ItemImage itemCode={aggTx.itemCode} className="size-6" />
            </ItemBackground>
            <span className="capitalize">{aggTx.itemCode}</span>
            for {moneyFormat.format(aggTx.money ?? 0)}
          </div>
        ))}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}
