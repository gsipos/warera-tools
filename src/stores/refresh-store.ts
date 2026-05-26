import { create } from 'zustand'

export interface RefreshState {
  /** Monotonically increasing counter; bump to signal "refetch everything". */
  epoch: number
}

export interface RefreshActions {
  /** Increment the epoch to trigger refetches in hooks watching it. */
  refresh: () => void
}

export type RefreshStore = RefreshState & RefreshActions

/**
 * Global refresh store.
 *
 * Hooks that need to respond to a manual "refresh all" action should include
 * `useRefreshStore((s) => s.epoch)` as a dependency in their query key or
 * use it inside a useEffect to trigger refetches.
 *
 * This decouples the refresh button from React Query's QueryClient directly,
 * making it work across both the global QueryClient and the persisted one.
 */
export const useRefreshStore = create<RefreshStore>((set) => ({
  epoch: 0,

  refresh: () => {
    set((state) => ({ epoch: state.epoch + 1 }))
  },
}))
