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

Use `@wareraprojects/api` (`createAPIClient`) which provides:

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

### Phase 2: Create new React Query hooks using the TRPC client

- [ ] Create a new file `src/api/queries.ts` with hooks that use the `@wareraprojects/api` client instead of raw fetch
- [ ] Migrate each hook from `warera-api.ts`:
  - `useCountries` → `client.country.getAllCountries()`
  - `useItemTradingPrices` → `client.itemTrading.getPrices()`
  - `useTradingTopOrders` → `client.tradingOrder.getTopOrders({ itemCode, limit })`
  - `useWorkOffers` → paginated via `autoPaginate` or manual cursor
  - `useWorkOffersByCompanyId` → `client.workOffer.getWorkOfferByCompanyId({ companyId })`
  - `useRegionObject` → `client.region.getRegionsObject()`
  - `useUsersByCountry` → `client.user.getUsersByCountry({ countryId, limit, autoPaginate: true })`
  - `useUserLite` → `client.user.getUserLite({ userId })`
  - `useUserCurrentEquipment` → `client.inventory.fetchCurrentEquipment({ userId })`
  - `useAllUsersLite` → batch via `Promise.all` on client calls (batching is automatic)
  - `useWorkOffersByCompanies` → batch via `Promise.all`
  - `useTransactions` → `client.transaction.getPaginatedTransactions(options)` with pagination
  - `useCompany` → `client.company.getById({ companyId })`
  - `useCompanies` → batch via `Promise.all` (auto-batched by tRPC link)
  - `useCompanyIdsByUserId` → `client.company.getCompanies({ userId })`
  - `useUserCompanies` → compose company IDs + getById
  - `useRecommendedRegionsForCompany` → `client.company.getRecommendedRegionIds({ companyId, includeDeposit })`
  - `useRecommendedRegionsForCompaniesBatch` → batch via `Promise.all`
- [ ] Keep React Query as the caching/state layer — only replace the `queryFn` implementations

### Phase 3: Handle pagination pattern change

- [ ] For paginated endpoints, decide between two approaches:
  - **Option A** (simpler): Use `autoPaginate: true` with `for await` in `queryFn`, collect all items
  - **Option B** (keeps infinite scroll UX): Keep `useInfiniteQuery` but call `client.endpoint({ cursor, limit })` in `queryFn`
- [ ] Remove `useAllPages` effect hook if Option A is chosen
- [ ] Update `src/functions/flatten-paginated-data.ts` if the data shape changes

### Phase 4: Remove old API infrastructure

- [ ] Remove `p-throttle` and `p-limit` from `package.json` (rate limiting handled by the TRPC client)
- [ ] Delete `src/api/warera-api-framework.ts`
- [ ] Delete `src/api/warera-api-types.d.ts` (types come from `@wareraprojects/api`)
- [ ] Delete `src/api/warera-api-schema.ts` (if Zod schemas are no longer needed for validation)
- [ ] Remove old `warera-api.ts` hooks file (replaced by new hooks)
- [ ] Remove `generate:schema` script from `package.json` if no longer needed

### Phase 5: Update consumers

- [ ] Update all imports across `src/hooks/game/*.ts` and `src/pages/` that reference old hooks/types
- [ ] Replace `WarEra.*` type references with types exported from `@wareraprojects/api`
- [ ] Update `useLoadingState` integration — decide if still needed or if React Query status is sufficient
- [ ] Verify all pages still render correctly

### Phase 6: Cleanup and validation

- [ ] Run `npm run lint` and `npm run build` to verify no regressions
- [ ] Test all pages manually (country dashboards, company views, trading, user profiles)
- [ ] Remove any unused dependencies from `package.json`

---

## Key Decisions Needed

1. **Pagination strategy**: Option A (auto-paginate all, simpler) vs Option B (keep infinite scroll UX for user-facing lists)?
2. **Loading state**: Keep the custom `useLoadingState` zustand store, or rely on React Query `isLoading`/`isFetching`?
3. **Type migration**: Use types directly from `@wareraprojects/api`, or keep a local type alias file for app-specific extensions?
4. **API key**: Continue using `VITE_WARERA_DEFAULT_API_KEY` env var (exposed in client bundle)?

---

## Benefits

- **Less code to maintain** — removes ~150 lines of custom fetch/throttle/batch logic
- **Better error handling** — automatic retries on transient failures
- **Type safety** — types derived from actual OpenAPI spec, always up to date
- **Batching improvements** — automatic batch splitting and recombination
- **Pagination** — built-in cursor management with `autoPaginate`

---

## Risks

- **Breaking changes** — response shapes from `@wareraprojects/api` may differ slightly from current manual types
- **Rate limit behavior** — the library defaults to 100-200 req/min (vs current 150 req/s); may need tuning
- **Bundle size** — adds `@trpc/client` as a transitive dependency
- **Env-specific concerns** — need to verify browser compatibility of the package (it supports both ESM + CJS)
