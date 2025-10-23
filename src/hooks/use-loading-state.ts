import { create } from 'zustand'

interface LoadingState {
  isLoading: boolean
  pending: number
  finished: number
  total: number
  progress: number
}

const initialLoadingState: LoadingState = {
  isLoading: false,
  pending: 0,
  finished: 0,
  total: 0,
  progress: 0,
}

interface LoadingActions {
  addItems: (count?: number) => void
  finishItems: (count?: number) => void
  reset: () => void
}

export type LoadingStateStore = LoadingState & LoadingActions

export const useLoadingState = create<LoadingStateStore>((set, get) => ({
  ...initialLoadingState,

  addItems: (count = 1) => {
    const { pending, finished, total } = get()
    const newPending = pending + count
    const newTotal = total + count
    const newProgress = newTotal === 0 ? 0 : (finished / newTotal) * 100
    set({
      isLoading: true,
      pending: newPending,
      total: newTotal,
      progress: newProgress,
    })
  },

  finishItems: (count = 1) => {
    const { pending, finished, total } = get()
    const newPending = Math.max(pending - count, 0)
    const newFinished = finished + count
    const newProgress = total === 0 ? 0 : (newFinished / total) * 100
    const isLoading = newPending > 0

    if (isLoading) {
      set({
        pending: newPending,
        finished: newFinished,
        progress: newProgress,
        isLoading,
      })
    } else {
      get().reset()
    }
  },
  reset: () => {
    set({ ...initialLoadingState })
  },
}))
