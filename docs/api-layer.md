# API Layer Architecture

This document describes how data fetching works in warera-tools, the rules for using it, and known limitations.

---

## Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     React Components                         │
│  (src/pages/*, src/components/*, src/hooks/game/*)           │
└─────────────────────────┬────────────────────────────────────┘
                          │ import hooks from src/api/warera-api.ts
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  useAsyncResource / useBatchAsyncResource                    │
│  (src/hooks/use-async-resource.ts)                           │
│  • Wraps React Query useQuery / useQueries                   │
│  • Injects refresh epoch into query keys                     │
│  • Tracks global loading state                               │
└─────────────────────────┬────────────────────────────────────┘
                          │ calls apiClient.* procedures
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  @wareraprojects/api — tRPC Client                           │
│  (src/api/client.ts)                                         │
│  • Automatic request batching (max 50 per batch)             │
│  • Built-in rate limiting (100–200 req/min with API key)     │
│  • Automatic retries with exponential backoff on 408/429/5xx │
│  • Auto-pagination via autoPaginate: true                    │
│  • End-to-end TypeScript types                               │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTPS
                          ▼
              https://api2.warera.io/trpc/
```

### Key Packages

| Package                    | Role                                                               |
| -------------------------- | ------------------------------------------------------------------ |
| `@wareraprojects/api`      | Typed tRPC client — handles HTTP, batching, retries, rate limiting |
| `@tanstack/react-query` v5 | Caching, deduplication, UI state (loading/error/success)           |
| `@instructure/idb-cache`   | IndexedDB persistence for opt-in immutable data caching            |
| `zustand`                  | Lightweight stores for refresh epoch and global loading state      |

---

## Rules for API Usage

### 1. All API calls go through `src/api/warera-api.ts`

Never call `apiClient` directly from pages or components. Every endpoint should be wrapped in a hook exported from `warera-api.ts`. This ensures:

- Consistent query keys for deduplication
- Automatic loading state tracking
- Uniform refresh behavior
- Single place to audit/change API usage

### 2. Use `useAsyncResource` for single queries

```typescript
// src/api/warera-api.ts
export const useCountries = () =>
  useAsyncResource(['country.getAllCountries'], () => cast<WarEra.Country[]>(apiClient.country.getAllCountries()))
```

The hook automatically:

- Includes the refresh epoch in the query key (so `refresh()` triggers a refetch)
- Reports loading state to the global loading indicator
- Returns standard React Query result (`{ data, isLoading, error }`)

### 3. Use `useBatchAsyncResource` for batched parallel queries

When you need to fetch the same endpoint for many IDs:

```typescript
export const useCompanies = (companyIds: string[]) =>
  useBatchAsyncResource(['company.getById'], companyIds, (id) =>
    cast<WarEra.Company>(apiClient.company.getById({ companyId: id })),
  )
```

This chunks requests (default 50 per chunk) and runs chunks in parallel via `useQueries`.

### 4. Use `collectPages` for paginated endpoints

```typescript
export const useWorkOffers = (limit: number = 10, maxPages: number = 50) =>
  useAsyncResource(
    ['workOffer.getWorkOffersPaginated', { limit, maxPages }],
    () =>
      collectPages(apiClient.workOffer.getWorkOffersPaginated({ limit, autoPaginate: true }), maxPages) as Cast<
        WarEra.WorkOffer[]
      >,
  )
```

Always pass a `maxPages` limit. See [Pagination Safeguards](#pagination-safeguards-and-best-practices) below.

---

## When to Use PersistedDataProvider

The `PersistedDataProvider` wraps a route (or subtree) with a separate QueryClient backed by IndexedDB. Use it **only** for data that is:

1. **Immutable** — historical records that never change once written
2. **Expensive to re-fetch** — large datasets or many pages of pagination
3. **Tolerant of staleness** — the user won't be confused by day-old data

### How it works

```typescript
// In a route component:
export const Route = createFileRoute('/users/$userId')({
  component: () => (
    <PersistedDataProvider>
      <RouteComponent />
    </PersistedDataProvider>
  ),
})
```

Inside that provider, queries using `usePersistedQuery` get:

- **24-hour stale time** — no refetch for 24 hours
- **`offlineFirst` network mode** — serves from IndexedDB immediately, revalidates in background
- **Persisted to IndexedDB** — survives page reloads and browser restarts
- **Throttled writes** — IndexedDB writes are throttled to every 15 seconds

### When NOT to use it

- Real-time data (prices, active offers, online users)
- Small/cheap endpoints (country list, region object)
- Data that changes frequently

### Cache busting

If persisted data becomes stale due to a schema change, bump `VITE_QUERY_CACHE_BUSTER` in `.env`. This invalidates the entire IndexedDB cache for all users on next page load.

---

## How the Refresh Mechanism Works

The app has a manual refresh system that lets users trigger a full data reload:

```
┌─────────────┐     refresh()      ┌──────────────────┐
│  UI Button  │ ──────────────────▶ │  useRefreshStore │
└─────────────┘                     │  epoch: N → N+1  │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    All query keys include
                                    { refreshEpoch: epoch }
                                             │
                                             ▼
                                    React Query sees new key
                                    → triggers refetch for
                                      all active queries
```

**How it works:**

1. `useRefreshStore` (zustand) holds a monotonically increasing `epoch` counter
2. `useAsyncResource` reads `epoch` and includes it in every query key
3. When a user clicks refresh, `epoch` increments
4. React Query treats the new key as a new query → refetches all active data

This is intentionally coarse-grained: one refresh reloads everything. For selective invalidation, use React Query's `queryClient.invalidateQueries()` directly.

---

## How to Handle New Endpoints Not in the Typed Client

When the WarEra API adds a new endpoint before the `@wareraprojects/api` package is updated:

### Option A: Use `rawTrpcFetch` (temporary stopgap)

```typescript
// src/api/warera-api.ts
export const useNewEndpoint = (someId: string) =>
  useAsyncResource(['namespace.newEndpoint', { someId }], () =>
    rawTrpcFetch<ExpectedResponseType>('namespace.newEndpoint', { someId }),
  )
```

**Limitations of `rawTrpcFetch`:**

- No automatic retries
- No rate limiting
- No request batching
- No type safety on input parameters
- Must be replaced once the typed client is updated

### Option B: Update `@wareraprojects/api` (preferred)

1. Update the package: `npm update @wareraprojects/api`
2. Add the hook using the typed client in `warera-api.ts`
3. Remove any `rawTrpcFetch` usage for that endpoint

**Always prefer Option B.** `rawTrpcFetch` exists only as a stopgap for rapid iteration.

---

## Pagination Safeguards and Best Practices

### The `collectPages` utility

All paginated endpoints use `collectPages()` which drains an async iterator into a flat array:

```typescript
async function collectPages<T>(
  iter: AsyncIterableIterator<{ items: T[]; cursor: string }>,
  maxPages: number = 100,
): Promise<T[]>
```

### Best practices

1. **Always set a reasonable `maxPages`** — prevents runaway pagination from consuming memory or stalling the UI

   | Endpoint         | Recommended maxPages | Rationale                  |
   | ---------------- | -------------------- | -------------------------- |
   | Work offers      | 50                   | Moderate dataset           |
   | Users by country | 20                   | Large per-page results     |
   | Transactions     | 100                  | Historical, possibly large |
   | Company IDs      | 100                  | Usually small total        |

2. **Watch for the console warning** — `[collectPages] Reached maxPages limit` means you're truncating results. Either increase the limit or add UI indication that results are partial.

3. **Use `limit` parameter wisely** — larger page sizes mean fewer round trips but larger individual responses. Start with 10–25 items per page.

4. **Don't set `maxPages: Infinity`** unless you're certain the dataset is bounded. Unbounded pagination can fetch thousands of pages.

5. **Paginated queries are all-or-nothing** — the hook waits until all pages are collected before returning data. For very large datasets, consider whether the user actually needs all records at once.

---

## Known Limitations & Technical Debt

### 1. `rawTrpcFetch` stopgap

**What:** A raw `fetch()` wrapper that bypasses the tRPC client entirely.

**Why it exists:** The `@wareraprojects/api` package doesn't expose every endpoint yet (e.g., `company.getRecommendedRegionIds`).

**Impact:**

- No retry on failure
- No rate limiting (can trigger 429s under load)
- No request batching
- Manual URL construction

**Resolution:** Remove once `@wareraprojects/api` exposes the missing endpoints. Track which hooks use it and migrate them as the package is updated.

### 2. Type casting approach

**What:** A `cast<T>()` helper forces the tRPC client's return type to match local `WarEra.*` types:

```typescript
type Cast<T> = Promise<T>
const cast = <T>(p: Promise<unknown>): Cast<T> => p as Cast<T>
```

**Why it exists:** The tRPC client returns structurally identical types that differ in minor strictness (e.g., `string` vs string-literal unions like `ItemCode`). The local `WarEra` namespace in `src/api/types.ts` preserves backward compatibility with existing components.

**Impact:**

- Hides potential type mismatches at the API boundary
- Runtime shape mismatches would only surface as bugs, not compile errors
- Duplicates type definitions between `@wareraprojects/api` and local types

**Resolution:** Gradually migrate components to use types directly from `@wareraprojects/api`. Once all consumers are updated, remove `src/api/types.ts` and the `cast<>` helper.

### 3. Rate limiting differences

**What:** The tRPC client and `rawTrpcFetch` have different rate limiting behavior.

| Aspect       | `@wareraprojects/api` client | `rawTrpcFetch` |
| ------------ | ---------------------------- | -------------- |
| Rate limit   | 100–200 req/min (built-in)   | None           |
| Retry on 429 | Yes (exponential backoff)    | No             |
| Batching     | Yes (up to 50 per batch)     | No             |

**Impact:** Heavy use of `rawTrpcFetch` can exhaust the API rate limit, causing failures for both raw and client-managed requests (they share the same API key/IP).

**Resolution:** Minimize `rawTrpcFetch` usage. If you must use it for a high-frequency endpoint, add manual throttling or switch to the typed client ASAP.

### 4. All-at-once pagination loading

**What:** Paginated hooks block until all pages are fetched. There's no incremental/streaming UI.

**Impact:** For large datasets (e.g., 100 pages of transactions), the user sees a loading spinner for the entire duration rather than progressive results.

**Resolution:** Consider adding incremental rendering for specific heavy endpoints if UX becomes a problem. React Query's `useInfiniteQuery` could provide this, but would require reworking the hook pattern.

---

## File Reference

| File                                        | Purpose                                                  |
| ------------------------------------------- | -------------------------------------------------------- |
| `src/api/client.ts`                         | Shared `apiClient` instance (singleton)                  |
| `src/api/warera-api.ts`                     | All API hooks — the single entry point for data fetching |
| `src/api/types.ts`                          | Local `WarEra.*` type namespace (backward compat bridge) |
| `src/api/warera-api-schema.ts`              | Zod schemas and item code enums                          |
| `src/hooks/use-async-resource.ts`           | `useAsyncResource` and `useBatchAsyncResource` wrappers  |
| `src/stores/refresh-store.ts`               | Zustand store for refresh epoch                          |
| `src/hooks/use-loading-state.ts`            | Global loading state tracking                            |
| `src/persistence/PersistedDataProvider.tsx` | React context for IndexedDB-backed queries               |
| `src/persistence/persisted-client.ts`       | Scoped QueryClient + IDB configuration                   |
| `src/persistence/usePersistedQuery.ts`      | Hook for queries inside PersistedDataProvider            |
