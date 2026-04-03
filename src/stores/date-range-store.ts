import { DateTime } from 'luxon'
import { create } from 'zustand'

export interface DateRangeState {
  startDate: DateTime
  endDate: DateTime
}

export interface DateRangeActions {
  setRange: (startDate: DateTime, endDate: DateTime) => void
  setStartDate: (startDate: DateTime) => void
  setEndDate: (endDate: DateTime) => void
  reset: () => void
}

export type DateRangeStore = DateRangeState & DateRangeActions

const initialState: DateRangeState = {
  startDate: DateTime.now().minus({ days: 7 }).startOf('day'),
  endDate: DateTime.now(),
}

export const useDateRangeStore = create<DateRangeStore>((set) => ({
  ...initialState,

  setRange: (startDate, endDate) => {
    set({ startDate, endDate })
  },

  setStartDate: (startDate) => {
    set({ startDate })
  },

  setEndDate: (endDate) => {
    set({ endDate })
  },

  reset: () => {
    set({ ...initialState })
  },
}))
