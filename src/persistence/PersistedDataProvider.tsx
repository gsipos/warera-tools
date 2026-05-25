import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ReactNode } from 'react'
import { persistedQueryClient, persistedStoragePersister } from './persisted-client'

interface PersistedDataProviderProps {
  children: ReactNode
}

/**
 * Provider component that enables IndexedDB persistence for its subtree.
 * Wrap route components that deal with expensive/immutable historical data
 * (e.g., transaction history) with this provider.
 *
 * Queries inside this provider use a dedicated QueryClient with aggressive
 * caching for immutable data. The persisted cache survives page reloads
 * and is invalidated only when VITE_QUERY_CACHE_BUSTER changes.
 *
 * Usage:
 *   <PersistedDataProvider>
 *     <YourTransactionHeavyComponent />
 *   </PersistedDataProvider>
 */
export function PersistedDataProvider({ children }: PersistedDataProviderProps) {
  return (
    <PersistQueryClientProvider
      client={persistedQueryClient}
      persistOptions={{ persister: persistedStoragePersister }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
