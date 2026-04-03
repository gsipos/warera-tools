import { DateTime } from 'luxon'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { cn } from '@/lib/utils'
import { useDateRangeStore } from '@/stores/date-range-store'

interface Props {
  className?: string
  onChange?: (value: string) => void
}

export const TimeRangeSelect = ({ className, onChange }: Props) => {
  const dateRange = useDateRangeStore()

  const handleChange = (value: string) => {
    const startDate = DateTime.fromISO(value)
    dateRange.setRange(startDate, DateTime.now())
    onChange?.(value)
  }

  return (
    <Select value={dateRange.startDate.toISODate() ?? ''} onValueChange={handleChange}>
      <SelectTrigger className={cn('w-full max-w-40', className)}>
        <SelectValue placeholder="Select a start date" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={DateTime.now().startOf('day').toISODate()}>Today</SelectItem>
        <SelectItem value={DateTime.now().minus({ day: 1 }).startOf('day').toISODate()}>Yesterday</SelectItem>
        <SelectItem value={DateTime.now().minus({ day: 7 }).startOf('day').toISODate()}>Last 7 days</SelectItem>
        <SelectItem value={DateTime.now().minus({ day: 14 }).startOf('day').toISODate()}>Last 14 days</SelectItem>
        <SelectItem value={DateTime.now().minus({ day: 30 }).startOf('day').toISODate()}>Last 30 days</SelectItem>
        <SelectItem value={DateTime.now().minus({ day: 60 }).startOf('day').toISODate()}>Last 60 days</SelectItem>
        <SelectItem value={DateTime.now().startOf('week').startOf('day').toISODate()}>This week</SelectItem>
        <SelectItem value={DateTime.now().startOf('month').startOf('day').toISODate()}>This month</SelectItem>
      </SelectContent>
    </Select>
  )
}
