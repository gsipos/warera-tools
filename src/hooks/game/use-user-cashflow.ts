import { DateTime } from 'luxon'
import { useMemo } from 'react'
import type { WarEra } from 'warera-api'

export interface UserCashflowDailyPoint {
  date: string
  income: number
  spending: number
  net: number
}

export interface UserCashflowTotals {
  incomeTotal: number
  spendingTotal: number
  netTotal: number
}

export interface UseUserCashflowInput {
  userId: string
  transactions: WarEra.Transaction[]
}

export interface UseUserCashflowResult {
  totals: UserCashflowTotals
  daily: UserCashflowDailyPoint[]
}

const normalizeMoney = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  if (typeof value === 'string') {
    const cleaned = value.trim().replaceAll(',', '')
    if (cleaned.length === 0) return null
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

const buildLast7DaysLocal = (now: DateTime): DateTime[] => {
  const today = now.toLocal().startOf('day')
  const start = today.minus({ days: 6 })
  return Array.from({ length: 7 }, (_, i) => start.plus({ days: i }))
}

const getLocalDayKey = (isoDateTime: string): string | null => {
  const dt = DateTime.fromISO(isoDateTime, { setZone: true })
  if (!dt.isValid) return null
  return dt.toLocal().toISODate()
}

const getCashflowDirection = (tx: WarEra.Transaction, userId: string) => {
  if (tx.sellerId === userId) return 'income' as const
  if (tx.buyerId === userId) return 'spending' as const
  return null
}

export const useUserCashflow = ({ userId, transactions }: UseUserCashflowInput): UseUserCashflowResult => {
  return useMemo(() => {
    const days = buildLast7DaysLocal(DateTime.now())
    const dayKeys = days.map((d) => d.toISODate() as string)

    const dailyByDate = new Map<string, Omit<UserCashflowDailyPoint, 'date'>>()
    dayKeys.forEach((date) => {
      dailyByDate.set(date, { income: 0, spending: 0, net: 0 })
    })

    transactions.forEach((tx) => {
      const direction = getCashflowDirection(tx, userId)
      if (!direction) return

      const dateKey = getLocalDayKey(tx.createdAt)
      if (!dateKey) return

      const bucket = dailyByDate.get(dateKey)
      if (!bucket) return // outside the last 7 days window

      const rawMoney = (tx as unknown as Record<string, unknown>).money
      const money = normalizeMoney(rawMoney)
      if (money === null) return

      if (direction === 'income') bucket.income += money
      else bucket.spending += money

      const safeIncome = Number.isFinite(bucket.income) ? bucket.income : 0
      const safeSpending = Number.isFinite(bucket.spending) ? bucket.spending : 0
      bucket.income = safeIncome
      bucket.spending = safeSpending
      bucket.net = safeIncome - safeSpending
    })

    const daily: UserCashflowDailyPoint[] = dayKeys.map((date) => {
      const bucket = dailyByDate.get(date) ?? { income: 0, spending: 0, net: 0 }
      return { date, ...bucket }
    })

    const incomeTotal = daily.reduce((sum, d) => sum + (Number.isFinite(d.income) ? d.income : 0), 0)
    const spendingTotal = daily.reduce((sum, d) => sum + (Number.isFinite(d.spending) ? d.spending : 0), 0)
    const netTotal = incomeTotal - spendingTotal

    return {
      totals: { incomeTotal, spendingTotal, netTotal },
      daily,
    }
  }, [transactions, userId])
}
