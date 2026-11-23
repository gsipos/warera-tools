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

4. **Global sync:** All transactions are synced regardless of type or filter. The metadata table tracks the overall sync cursors (newest/oldest timestamps synced). This keeps implementation simple and ensures any page can query any dimension of the data without triggering scope-specific syncs.

### Sync Lifecycle

```
App loads → Forward sync (fetch newest since last sync)
Tab gains focus (visibilitychange) → Forward sync if last sync > 1-2 hours ago
User on transaction page → Check local coverage → Backward sync if gap exists
Optional → Manual "Sync" button when data staleness > 1-2 hours
```

Key constraints:
- No sync while tab is hidden/background
- Each page of results is stored immediately (progressive availability)
- UI renders whatever is locally available and reactively updates as new records arrive

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

### Initial integration: Crafting page (`src/pages/crafting.tsx`)

The crafting page is the pilot for local store integration because:
- It currently fires 12+ parallel API calls (one per equipment code for random craft analysis)
- It benefits most from longer date ranges (profitability analysis improves with more historical data)
- It's a self-contained page with no shared state dependencies

**Changes:**
- Replace `useEquipmentTransactions` calls with local Dexie queries
- Allow date range to extend beyond the current 2-week default (since local queries are free)
- Charts render progressively — show available data immediately, expand as sync completes
- No blocking loading states; partial data is acceptable and expected

### Future pages (follow-up work):
- `itemMarket.index.tsx` — Equipment price analysis
- `users.$userId.tsx` — User cashflow
- User trading/item market cards

---

## Phase 5: Migration & Cleanup

### Goals
- Gradually migrate remaining pages from remote-fetch hooks to local-query hooks
- Deprecate the `PersistedDataProvider` approach for transaction data once all consumers are migrated
- Keep remote API hooks available for non-transaction or real-time data

### Migration path:
1. Crafting page uses local store (Phase 4 — initial pilot)
2. Migrate itemMarket page as second consumer
3. Migrate user profile cards (cashflow, trading, item market cards)
4. Once all transaction consumers are migrated, remove `PersistedDataProvider` wrapping
5. Remove `@instructure/idb-cache` and `@tanstack/query-async-storage-persister` if no other consumers remain

---

## Phase 6: Advanced Features (Future)

- **Web Worker sync:** Move sync engine to a Web Worker to avoid blocking UI thread during large backfills
- **Selective purging:** Auto-delete transactions older than N months to manage IndexedDB storage limits
- **Export/Import:** Allow users to export their local transaction store (backup/restore)
- **Cross-tab sync:** Use Dexie's observable / BroadcastChannel to keep multiple tabs in sync
- **Aggregation tables:** Pre-compute daily/weekly summaries into a separate Dexie table for instant dashboard rendering

---

## Decisions (Finalized)

| # | Question | Decision |
|---|---|---|
| 1 | **Sync trigger** | Background sync on app load; periodic refresh every 1-2 hours; re-sync on tab focus (visibilitychange). No sync while tab is hidden. Show a manual "Sync" button in UI when data is older than 1-2 hours. |
| 2 | **Backfill depth** | 30 days (defined as a constant, tunable later based on performance testing) |
| 3 | **Storage budget** | Cap at 100MB if implementation is straightforward; skip cap if complex to implement |
| 4 | **Sync scope** | Global — sync all transactions regardless of type/user/item. The app uses transactions across many dimensions and will expand usage over time. |
| 5 | **Conflict resolution** | None needed. Transactions are immutable. API is the single source of truth. If a game reset/backup occurs, user can clear local store. No engineering effort on reconciliation. |
| 6 | **Rollout strategy** | No feature flag. Implement on the **crafting page first** as the pilot. Other pages continue using existing hooks until migrated in follow-up work. |
| 7 | **UX philosophy** | Never block the UI behind a loading/progress bar. Show partial data immediately and let charts/tables expand progressively as more data syncs in (e.g., first show 3 days, then 2 weeks, then full range). Leverage Dexie's `useLiveQuery` reactivity for this naturally. |
| 8 | **Crafting page scope** | Improve the UX while migrating (progressive data display, longer date ranges now "free") but keep the page functional throughout — no breaking changes. |

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
