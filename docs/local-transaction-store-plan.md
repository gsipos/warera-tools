# Plan: Local Transaction Store with IndexedDB + Dexie.js

## Summary

Build a local IndexedDB-backed transaction store using Dexie.js that syncs transaction data from the remote API and provides fast, indexed local querying — replacing the current pattern of auto-paginating through remote API pages for historical data.

---

## Current State

The app fetches transactions via `useTransactions()` → tRPC `getPaginatedTransactions` with `autoPaginate: true` → `collectPages()` drains all pages into a flat array. This works acceptably for recent data (7–14 days), but becomes slow for longer time ranges because:

- Each page requires a round-trip
- No local caching of individual transaction records between sessions
- The existing `@instructure/idb-cache` persistence layer stores **serialized query results** (whole arrays), not queryable individual records
- Re-visiting a page or changing a filter re-fetches everything from scratch

---

## Target State

A **Dexie.js** database stores individual transaction records with indexed fields. A sync engine keeps the local store up-to-date with the remote API. Consumer hooks query Dexie directly for historical data — instant, offline-capable, and filterable without network calls.

---

## Architecture Overview

```
┌──────────────┐      sync       ┌──────────────────┐     query      ┌──────────────┐
│  Remote API  │  ─────────────► │  Dexie.js Store  │ ◄──────────────│  React Hooks │
│  (tRPC)      │                 │  (IndexedDB)     │                │  (consumers) │
└──────────────┘                 └──────────────────┘                └──────────────┘
       ▲                                  │
       │          ┌───────────────┐       │
       └──────────│  Sync Engine  │───────┘
                  └───────────────┘
```

---

## Phase 1: Dexie.js Database Schema & Setup

### Goals
- Install Dexie.js
- Define the transactions table schema with appropriate indexes
- Create a singleton database instance

### Details

**Database schema (transactions table):**
- Primary key: `_id` (transaction ID from API)
- Indexed fields: `createdAt`, `transactionType`, `itemCode`, `sellerId`, `buyerId`, `countryId`, `muId`
- Compound indexes for common query patterns: `[transactionType+itemCode]`, `[itemCode+createdAt]`

**Sync metadata table:**
- Tracks sync cursors (newest synced timestamp, oldest synced timestamp)
- Per-scope sync state (e.g., per-user, per-item, global)

**Files to create:**
- `src/local-store/db.ts` — Dexie database definition
- `src/local-store/index.ts` — barrel export

**Dependencies to add:**
- `dexie` (^4.x) — IndexedDB wrapper with typed queries, compound indexes, live queries
- `dexie-react-hooks` — `useLiveQuery` for reactive React integration

---

## Phase 2: Sync Engine

### Goals
- Implement a strategy to populate the local store from the remote API
- Handle both "catch up to present" and "backfill historical" scenarios
- Track sync progress to avoid redundant fetches

### Sync Strategy: Dual-Cursor Approach

1. **Forward sync (new data):** On app load or periodic interval, fetch transactions newer than the most recent local record. Uses `cursor` (newest-first pagination) until it hits a record already in the store. This keeps the local store current with minimal API calls.

2. **Backward sync (historical backfill):** When a user requests data older than what's locally available, paginate backward from the oldest local record. This is a background/on-demand operation — triggered by user action (e.g., expanding date range) or a background worker.

3. **Deduplication:** Dexie's `bulkPut` with `_id` as primary key naturally deduplicates — upserting existing records.

4. **Scoped sync:** Sync can be triggered per-filter (e.g., "sync all `itemMarket` transactions for item `rifle`") or globally. The metadata table tracks what's been synced per scope.

### Sync Lifecycle

```
App starts → Forward sync (fetch newest since last sync)
User requests historical data → Check local coverage → Backward sync if gap exists
Background (optional) → Periodic forward sync every N minutes
```

### Rate Limiting & Batching
- Reuse the existing tRPC client (inherits rate limiting, retries)
- Paginate in chunks (50 per page), store each page immediately (progressive availability)
- Abort controller support for cancelling long backfills

### Files to create:
- `src/local-store/sync-engine.ts` — Core sync logic (forward/backward sync functions)
- `src/local-store/sync-metadata.ts` — Sync state tracking (cursors, timestamps, scopes)
- `src/local-store/sync-scheduler.ts` — Scheduling/triggering logic (on-mount, on-demand, periodic)

---

## Phase 3: Query Layer (Dexie Hooks)

### Goals
- Provide React hooks that query the local Dexie store
- Mirror the current `useTransactions` / `useTimeBoxedTransactions` API surface
- Return reactive data (re-render when store updates)

### Approach

Use **Dexie's `useLiveQuery`** hook (from `dexie-react-hooks`) which provides reactive queries — components re-render automatically when matching IndexedDB records change.

### Hooks to create:

| Hook | Purpose | Replaces |
|------|---------|----------|
| `useLocalTransactions(filters, dateRange)` | Query local store with filters | `useTransactions` (for historical) |
| `useLocalTimeBoxedTransactions(options, timeOptions)` | Date-bounded local query | `useTimeBoxedTransactions` |
| `useLocalTransactionCount(filters)` | Fast count query | N/A (new capability) |
| `useLocalTransactionAggregation(filters)` | Pre-computed aggregates | `useAggregatedTransactions` |
| `useSyncStatus()` | Expose sync progress/state to UI | N/A (new) |

### Query Capabilities (leveraging Dexie indexes):

- Filter by `transactionType`, `itemCode`, `sellerId`, `buyerId`, `countryId`
- Date range queries on `createdAt` index
- Compound queries (e.g., all `itemMarket` transactions for `rifle` in last 30 days)
- Sorting by `createdAt` (descending for recent-first)
- Pagination via `.offset()` / `.limit()` for UI tables

### Files to create:
- `src/local-store/hooks/useLocalTransactions.ts`
- `src/local-store/hooks/useLocalTimeBoxedTransactions.ts`
- `src/local-store/hooks/useSyncStatus.ts`
- `src/local-store/hooks/index.ts`

---

## Phase 4: Integration with Existing Pages

### Goals
- Swap existing remote-fetch hooks for local-query hooks where beneficial
- Keep remote API as fallback for real-time / non-synced data
- Add sync status UI indicators

### Strategy: Hybrid Approach

```typescript
// Pattern: Try local first, trigger sync if needed
const useHybridTransactions = (options, dateRange) => {
  const localData = useLocalTransactions(options, dateRange)
  const syncStatus = useSyncStatus(options, dateRange)

  // If local store doesn't cover the requested range, trigger backfill
  useEffect(() => {
    if (syncStatus.coverageGap) {
      triggerBackwardSync(options, dateRange)
    }
  }, [syncStatus.coverageGap])

  return { data: localData, isBackfilling: syncStatus.isSyncing }
}
```

### Pages to update:
- `itemMarket.index.tsx` — Equipment price analysis (primary beneficiary)
- `users.$userId.tsx` — User cashflow (currently limited to 7 days; could expand with local store)
- Any page using `useTimeBoxedTransactions` or `useEquipmentTransactions`

### UI additions:
- Sync status indicator (last synced, records count, sync progress)
- "Load more history" button for on-demand backfill
- Offline badge when serving from local store without network

---

## Phase 5: Migration & Cleanup

### Goals
- Deprecate the current `PersistedDataProvider` approach for transactions
- Remove redundant TanStack Query persistence for transaction data
- Keep remote API hooks available for non-transaction or real-time data

### Migration path:
1. Add feature flag (`VITE_USE_LOCAL_TX_STORE`) to toggle between old and new system
2. Run both systems in parallel during validation period
3. Once stable, remove the `PersistedDataProvider` wrapping from transaction pages
4. Remove `@instructure/idb-cache` and `@tanstack/query-async-storage-persister` if no other consumers remain

---

## Phase 6: Advanced Features (Future)

- **Web Worker sync:** Move sync engine to a Web Worker to avoid blocking UI thread during large backfills
- **Selective purging:** Auto-delete transactions older than N months to manage IndexedDB storage limits
- **Export/Import:** Allow users to export their local transaction store (backup/restore)
- **Cross-tab sync:** Use Dexie's observable / BroadcastChannel to keep multiple tabs in sync
- **Aggregation tables:** Pre-compute daily/weekly summaries into a separate Dexie table for instant dashboard rendering

---

## Key Decisions Needed

1. **Sync trigger:** Automatic on app load + periodic, or purely on-demand when user visits a transaction page?
2. **Backfill depth:** How far back should historical sync go? (e.g., 90 days, 1 year, unlimited)
3. **Storage budget:** IndexedDB has browser-specific quotas (typically 50%+ of disk). Should we implement a cap/LRU purge?
4. **Granularity of sync scopes:** Sync all transactions globally, or per-user / per-item / per-type independently?
5. **Conflict resolution:** Transactions are immutable (write-once), so no conflicts expected. But what about API-side deletions (if any)?
6. **Feature flag:** Ship behind a flag and gradually roll out, or replace wholesale?

---

## Benefits

- **Instant queries** — No network round-trips for historical data; IndexedDB queries are sub-millisecond for indexed fields
- **Offline support** — Transaction history available without network
- **Flexible filtering** — Compound index queries that aren't possible with the paginated API (e.g., "all trades by user X for item Y in date range")
- **Reduced API load** — Only fetch new data; never re-fetch old transactions
- **Better UX for long date ranges** — Loading 6 months of data no longer means paginating through hundreds of API pages
- **Progressive enhancement** — Data appears immediately from local store while fresh data syncs in background

---

## Risks

- **IndexedDB storage limits** — Browser may evict data under storage pressure (mitigate: use `navigator.storage.persist()`)
- **Initial sync cost** — First-time users must wait for initial data population (mitigate: show progress, start with recent data)
- **Schema migrations** — Dexie handles version upgrades, but large schema changes on populated stores can be slow
- **Data freshness** — Users might see stale data if forward sync lags (mitigate: show "last synced" timestamp, allow manual refresh)
- **Bundle size** — Dexie adds ~40KB gzipped (acceptable for the functionality gained)

---

## Alternatives Considered

| Option | Verdict |
|--------|---------|
| **Enhanced TanStack Query persistence** | Doesn't solve core problem — can't query individual records from serialized cache |
| **RxDB** | Viable but heavier (~200KB); built-in replication is nice but overkill for read-only immutable data |
| **SQLite WASM (wa-sqlite)** | More query power (full SQL) but no reactive hooks, larger bundle, more plumbing |
| **Electric SQL** | Wrong architecture — requires owning the backend Postgres database |
| **Dexie Cloud** | Commercial sync service; not applicable when syncing from external API |

Dexie.js was chosen for: minimal bundle size, excellent TypeScript support, built-in reactive hooks (`useLiveQuery`), compound indexes, and right-sized complexity for immutable append-only transaction data.
