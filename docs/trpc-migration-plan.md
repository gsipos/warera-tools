# Migration Plan: Replace custom API layer with @wareraprojects/api (TRPC client)

## Summary

Replace the hand-rolled `src/api/` layer (custom fetch wrappers, manual type declarations, throttling) with the [`@wareraprojects/api`](https://github.com/WarEraProjects/TRPC) package — a fully-typed tRPC client that provides type-safe procedure calls, built-in rate limiting, batching, retries, and auto-pagination out of the box.

---

## Current State

The existing API layer consists of:

- **`src/api/warera-api-framework.ts`** — Custom `fetch`-based framework with:
  - `warEraApiFetch` / `warEraBaseApiFetch` — raw fetch + JSON parsing
  - `useWarEraApiQuery` — React Query wrapper for single queries
  - `usePaginatedWarEraApiQuery` — React Query infinite query wrapper
  - `useWarEraApiBatchQuery` — batched tRPC queries (chunked to 50)
  - `useAllPages` — effect-based auto-pagination
  - Rate limiting via `p-throttle` (150 req/s) and concurrency via `p-limit` (10)
  - Manual URL construction for tRPC endpoints
- **`src/api/warera-api.ts`** — ~25 hook wrappers using the framework (e.g. `useCountries`, `useCompany`, `useTransactions`)
- **`src/api/warera-api-types.d.ts`** — Hand-written `declare module "warera-api"` with all response/request types
- **`src/api/warera-api-schema.ts`** — Zod schemas for validation

---

## Target State

Use `@wareraprojects/api` (`createAPIClient`) as the **primary data-fetching layer** — most calls go through the tRPC client directly with no caching wrapper.

**TanStack Query becomes optional** — only used where IndexedDB persistence of responses provides clear value (e.g. large historical datasets that never change). A small utility wrapper opts specific queries into persistence; everything else is a plain `await client.endpoint()`.

The tRPC client provides:

- ✅ Full TypeScript type safety derived from OpenAPI spec + custom endpoint definitions
- ✅ Built-in HTTP batch splitting (max 50 ops, same as current)
- ✅ Rate limiting (100-200 req/min with API key)
- ✅ Retry with exponential backoff on 408/429/5xx
- ✅ Auto-pagination via `autoPaginate: true` returning `AsyncIterableIterator`
- ✅ Dot-notation procedure calls (`client.country.getAllCountries()`)
- ✅ API key support via `x-api-key` header

---

## Migration Steps

### Phase 1: Install and configure the client

- [ ] Install `@wareraprojects/api` as a dependency
- [ ] Create a shared client instance (e.g. `src/api/client.ts`) using `createAPIClient({ apiKey: import.meta.env.VITE_WARERA_DEFAULT_API_KEY })`
- [ ] Verify the client works with a basic call (e.g. `client.country.getAllCountries()`)

### Phase 2: Remove TanStack Query as the default — use tRPC client directly

- [ ] Most hooks become simple async functions or thin React wrappers (e.g. `useState` + `useEffect`, or React `use()` with Suspense)
- [ ] Replace each hook from `warera-api.ts` with a direct client call:
  - `useCountries` → `client.country.getAllCountries()`
  - `useItemTradingPrices` → `client.itemTrading.getPrices()`
  - `useTradingTopOrders` → `client.tradingOrder.getTopOrders({ itemCode, limit })`
  - `useWorkOffers` → paginated via `autoPaginate` or manual cursor
  - `useWorkOffersByCompanyId` → `client.workOffer.getWorkOfferByCompanyId({ companyId })`
  - `useRegionObject` → `client.region.getRegionsObject()`
  - `useUsersByCountry` → `client.user.getUsersByCountry({ countryId, limit, autoPaginate: true })`
  - `useUserLite` → `client.user.getUserLite({ userId })`
  - `useUserCurrentEquipment` → `client.inventory.fetchCurrentEquipment({ userId })`
  - `useAllUsersLite` → batch via `Promise.all` on client calls
  - `useWorkOffersByCompanies` → batch via `Promise.all`
  - `useTransactions` → `client.transaction.getPaginatedTransactions(options)` — **candidate for persistence** (see Phase 3)
  - `useCompany` → `client.company.getById({ companyId })`
  - `useCompanies` → batch via `Promise.all`
  - `useCompanyIdsByUserId` → `client.company.getCompanies({ userId })`
  - `useUserCompanies` → compose company IDs + getById
  - `useRecommendedRegionsForCompany` → `client.company.getRecommendedRegionIds({ companyId, includeDeposit })`
  - `useRecommendedRegionsForCompaniesBatch` → batch via `Promise.all`
- [ ] Remove the global `QueryClientProvider` and `PersistQueryClientProvider` wrappers from `App.tsx` / `index.tsx`
- [ ] Remove `AppQueryCacheRestoringScreen` (no longer needed as default)

### Phase 3: Create opt-in persistence utility for historical data

- [ ] Create a small utility (e.g. `src/functions/persisted-query.ts`) that:
  - Provides a scoped `QueryClient` with IndexedDB persistence (using `idb-keyval` or `idb-cache`)
  - Exposes a hook like `usePersistedQuery(key, fetcher)` for opt-in usage
  - Sets aggressive `staleTime` (infinite or very long) + `gcTime` for immutable data
- [ ] Identify which data truly benefits from persistence:
  - Historical transaction data (immutable, large, expensive to re-fetch) — **candidate**
  - Consider alternative: direct IndexedDB storage without TanStack Query overhead
- [ ] Keep TanStack Query as a **devDependency-level concern** — only imported where needed, tree-shaken from pages that don't use it

### Phase 4: Handle pagination

- [ ] For paginated endpoints, use `autoPaginate: true` with `for await` — collect all items directly
- [ ] Remove `useAllPages` effect hook
- [ ] Remove `src/functions/flatten-paginated-data.ts` (no more `InfiniteData` wrappers)

### Phase 5: Remove old API infrastructure

- [ ] Remove `p-throttle` and `p-limit` from `package.json`
- [ ] Delete `src/api/warera-api-framework.ts`
- [ ] Delete `src/api/warera-api-types.d.ts`
- [ ] Delete `src/api/warera-api-schema.ts` (if Zod schemas are no longer needed)
- [ ] Remove old `warera-api.ts` hooks file
- [ ] Remove `generate:schema` script from `package.json` if no longer needed
- [ ] Remove `@tanstack/react-query-persist-client` and `@tanstack/query-async-storage-persister` (persistence is now opt-in and minimal)
- [ ] Remove `src/functions/react-query-setup.ts` (global QueryClient config no longer needed)
- [ ] Evaluate whether `@tanstack/react-query` itself can become an optional/lazy dependency

### Phase 6: Update consumers

- [ ] Update all imports across `src/hooks/game/*.ts` and `src/pages/`
- [ ] Replace `WarEra.*` type references with types from `@wareraprojects/api`
- [ ] Update `useLoadingState` — likely still useful for global loading indicators on direct fetches
- [ ] Verify all pages still render correctly

### Phase 7: Cleanup and validation

- [ ] Run `npm run lint` and `npm run build` to verify no regressions
- [ ] Test all pages manually (country dashboards, company views, trading, user profiles)
- [ ] Remove any unused dependencies from `package.json`

---

## Key Decisions Needed

1. **Persistence candidates**: Which specific datasets justify IndexedDB caching? (Historical transactions are the primary candidate — but a raw IndexedDB store might be simpler than TanStack Query for truly immutable data)
2. **React data-fetching pattern**: `useState` + `useEffect`, React `use()` with Suspense, or a tiny custom hook? Pick one default pattern for non-persisted data.
3. **Loading state**: Keep `useLoadingState` zustand store for global loading indicators on direct async calls
4. **Type migration**: Use types directly from `@wareraprojects/api`, or keep a local type alias file?
5. **API key**: Continue using `VITE_WARERA_DEFAULT_API_KEY` env var (exposed in client bundle)?

---

## Benefits

- **Less code to maintain** — removes ~150 lines of custom fetch/throttle/batch logic + the global React Query setup
- **Simpler mental model** — most data is fetched fresh on demand, no stale cache surprises
- **Smaller bundle** — TanStack Query + persist plugins only loaded where actually needed (or removed entirely)
- **Better error handling** — automatic retries on transient failures via tRPC client
- **Type safety** — types derived from actual OpenAPI spec, always up to date
- **Batching improvements** — automatic batch splitting and recombination
- **Pagination** — built-in cursor management with `autoPaginate`

---

## Risks

- **Breaking changes** — response shapes from `@wareraprojects/api` may differ slightly from current manual types
- **Rate limit behavior** — the library defaults to 100-200 req/min (vs current 150 req/s); may need tuning
- **Bundle size** — adds `@trpc/client` as a transitive dependency
- **Env-specific concerns** — need to verify browser compatibility of the package (it supports both ESM + CJS)
