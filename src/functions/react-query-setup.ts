import { PersistedClient, persistQueryClient } from '@tanstack/react-query-persist-client'
import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { del, get, set } from 'idb-keyval'

export const DEFAULT_QUERY_STALE_TIME = 15 * 60 * 1000 // 15min

const asyncStorage = {
  getItem: (key: string) => get(key),
  setItem: (key: string, value: string) => set(key, value),
  removeItem: (key: string) => del(key),
}

const asyncStoragePersister = createAsyncStoragePersister({
  storage: asyncStorage,
  throttleTime: 1000,
  key: 'reactQuery',
  serialize: (client: PersistedClient) => client as unknown as string,
  deserialize: (cached: string) => cached as unknown as PersistedClient,
})

const exponentialBackoff = (attemptIndex: number) => Math.min(1_000 * 2 ** attemptIndex, 30_000)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 2, // 24 hours
      staleTime: DEFAULT_QUERY_STALE_TIME, // 15min
      networkMode: 'offlineFirst',
      retry: 5,
      retryDelay: exponentialBackoff,
    },
  },
})

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  buster: import.meta.env.VITE_QUERY_CACHE_BUSTER,
})
