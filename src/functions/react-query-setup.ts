import { PersistedClient } from '@tanstack/react-query-persist-client'
import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { del, get, set } from 'idb-keyval'

export const DEFAULT_QUERY_STALE_TIME = 1 * 60 * 60 * 1000 // 1 hour
export const LONG_QUERY_STALE_TIME = 6 * 60 * 60 * 1000 // 6 hours

const asyncStorage = {
  getItem: async (key: string) => {
    console.time(`idb-keyval get ${key}`)
    const result = await get(key)
    console.timeEnd(`idb-keyval get ${key}`)
    return result
  },
  setItem: async (key: string, value: string) => {
    console.time(`idb-keyval set ${key}`)
    await set(key, value)
    console.timeEnd(`idb-keyval set ${key}`)
  },
  removeItem: (key: string) => del(key),
}

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: asyncStorage,
  throttleTime: 10_000,
  key: 'warera-tools-query-cache',
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
      experimental_prefetchInRender: true,
    },
  },
})

/*
persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  buster: import.meta.env.VITE_QUERY_CACHE_BUSTER,
})
*/
