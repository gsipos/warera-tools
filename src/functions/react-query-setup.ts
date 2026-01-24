import { PersistedClient } from '@tanstack/react-query-persist-client'
import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { del, get, set } from 'idb-keyval'
import { IDBCache } from '@instructure/idb-cache'
import { useLoadingState } from '@/hooks/use-loading-state'

export const DEFAULT_QUERY_STALE_TIME = 1 * 60 * 60 * 1000 // 1 hour
export const LONG_QUERY_STALE_TIME = 6 * 60 * 60 * 1000 // 6 hours

const idbCache = new IDBCache({
  cacheKey: 'warera-tools-idb-cache',
  cacheBuster: import.meta.env.VITE_QUERY_CACHE_BUSTER,
})

const asyncStorage = {
  getItem: async (key: string) => get(key),
  setItem: async (key: string, value: string) => set(key, value),
  removeItem: (key: string) => del(key),
}

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: idbCache,
  throttleTime: 10_000,
  key: 'warera-tools-query-cache',
})

const exponentialBackoff = (attemptIndex: number) => {
  useLoadingState.getState().onRequestRetry()
  return Math.min(1_000 * 2 ** attemptIndex, 30_000)
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000, // 5 seconds
      staleTime: DEFAULT_QUERY_STALE_TIME,
      networkMode: 'offlineFirst',
      retry: 5,
      retryDelay: exponentialBackoff,
      experimental_prefetchInRender: true,
    },
  },
})
