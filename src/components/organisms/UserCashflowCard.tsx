import { useTransactions } from '@/api/warera-api'
import { moneyFormat } from '@/functions/number-formats'
import { useTimeBoxedTransactions } from '@/hooks/game/use-time-boxed-transactions'
import { useUserCashflow } from '@/hooks/game/use-user-cashflow'
import { DateTime } from 'luxon'
import { useMemo } from 'react'
import { CashflowTimeSeriesChart, type CashflowDataPoint } from './CashflowTimeSeriesChart'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export const UserCashflowCard = ({ userId }: { userId: string }) => {
  const txQuery = useTransactions({ userId })

  const from = useMemo(() => {
    return DateTime.now().startOf('day').minus({ days: 6 })
  }, [])

  const transactions = useTimeBoxedTransactions(txQuery, { from })

  const { totals, daily } = useUserCashflow({
    userId,
    transactions,
  })

  const chartDataset = useMemo<CashflowDataPoint[]>(() => {
    return daily.map((d) => ({
      date: d.date,
      income: d.income,
      spending: d.spending,
    }))
  }, [daily])

  const isEmpty = transactions.length === 0

  const incomeTotal = Number.isFinite(totals.incomeTotal) ? totals.incomeTotal : 0
  const spendingTotal = Number.isFinite(totals.spendingTotal) ? totals.spendingTotal : 0
  const netTotal = Number.isFinite(totals.netTotal) ? totals.netTotal : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cashflow (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-muted-foreground text-xs uppercase">Income</div>
            <div>{moneyFormat.format(incomeTotal)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs uppercase">Spending</div>
            <div>{moneyFormat.format(spendingTotal)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs uppercase">Net</div>
            <div>{moneyFormat.format(netTotal)}</div>
          </div>
        </div>

        {isEmpty ? <div className="text-muted-foreground text-sm">No transactions in the last 7 days</div> : null}

        {!isEmpty ? <CashflowTimeSeriesChart dataset={chartDataset} className="h-120 w-full" /> : null}
      </CardContent>
    </Card>
  )
}
