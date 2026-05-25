import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { IDBCache } from '@instructure/idb-cache'

/**
 * Stale time for immutable historical data (e.g., completed transactions).
 * These records never change once written, so we can cache them aggressively.
 */
export const IMMUTABLE_DATA_STALE_TIME = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Dedicated IDB cache instance for persisted transaction data.
 * Separated from the main app cache so clearing one doesn't affect the other.
 */
const persistedIdbCache = new IDBCache({
  cacheKey: 'warera-tools-persisted-data',
  cacheBuster: import.meta.env.VITE_QUERY_CACHE_BUSTER,
})

/**
 * Async storage persister scoped to historical/transaction data.
 * Uses a dedicated IDB store with a longer throttle to reduce write overhead.
 */
export const persistedStoragePersister = createAsyncStoragePersister({
  storage: persistedIdbCache,
  throttleTime: 15_000,
  key: 'warera-tools-persisted-queries',
})

/**
 * Scoped QueryClient for routes that need IndexedDB persistence.
 * Configured with aggressive staleTime for immutable historical data
 * and longer gcTime to keep data available between sessions.
 */
export const persistedQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 24 * 60 * 60 * 1000, // 24 hours — keep persisted data longer
      staleTime: IMMUTABLE_DATA_STALE_TIME,
      networkMode: 'offlineFirst',
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(1_000 * 2 ** attemptIndex, 30_000),
      experimental_prefetchInRender: true,
    },
  },
})
