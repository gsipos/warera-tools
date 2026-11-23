---
name: warera-api
description: How warera-tools fetches game data from the WarEra tRPC API through the @wareraprojects/api SDK. Use when adding or changing a data hook in src/api/warera-api.ts, calling a new endpoint, debugging rate limits or pagination, registering a custom endpoint, or upgrading the SDK. Includes the full procedure list and the 0.3.2 to 0.4.0 delta.
---

# WarEra API and SDK

All game data comes from `https://api2.warera.io/trpc` through the typed tRPC client `@wareraprojects/api`. The app wraps it in React Query hooks. `docs/api-layer.md` is the long-form architecture doc; this skill is the working reference.

## Map

| File                              | Role                                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/api/client.ts`               | Singleton `apiClient = createAPIClient({ apiKey, url, retry })`. Retries bump the loading UI.   |
| `src/api/warera-api.ts`           | Every exported data hook. The only file that calls `apiClient`.                                 |
| `src/api/types.ts`                | `WarEra.*` namespace: SDK types narrowed to literal unions (`ItemCode`, `TransactionType`).     |
| `src/api/warera-api-schema.ts`    | Item, weapon and armor code constants plus a few zod schemas.                                   |
| `src/api/warera-item-recipes.ts`  | Static crafting recipe table (game knowledge, not an endpoint).                                 |
| `src/hooks/use-async-resource.ts` | `useAsyncResource` and `useBatchAsyncResource`: React Query + loading state + refresh epoch.    |
| `src/persistence/`                | Opt-in IndexedDB QueryClient for immutable data (`PersistedDataProvider`, `usePersistedQuery`). |

## Hook recipes

Add hooks to `src/api/warera-api.ts`, grouped under the existing section comments. Query keys start with the procedure name so they stay unique and greppable.

Single call:

```ts
export const useCountryById = (countryId: string) =>
  useAsyncResource(['country.getCountryById', { countryId }], () =>
    cast<WarEra.Country>(apiClient.country.getCountryById({ countryId })),
  )
```

Many ids of the same procedure (chunked 50 per `useQueries` entry; the SDK batches the HTTP calls):

```ts
export const useCompanies = (companyIds: string[]) =>
  useBatchAsyncResource(['company.getById', 'batch'], companyIds, (companyId) =>
    cast<WarEra.Company>(apiClient.company.getById({ companyId })),
  )
```

Paginated procedure (always cap pages):

```ts
export const useWorkOffers = (limit = 10, maxPages = 50) =>
  useAsyncResource(
    ['workOffer.getWorkOffersPaginated', { limit, maxPages }],
    () =>
      collectPages(apiClient.workOffer.getWorkOffersPaginated({ limit, autoPaginate: true }), maxPages) as Cast<
        WarEra.WorkOffer[]
      >,
  )
```

Derived data (joins, aggregation, time boxing) goes in `src/hooks/game/`, not in `warera-api.ts`.

`cast<T>()` exists because SDK response types use `string` where the UI wants literal unions. Prefer re-exporting an SDK type through `src/api/types.ts` over inventing a parallel interface. Add a new literal to `WarEra.ItemCode` and `warera-api-schema.ts` together when the game adds an item.

## SDK facts worth knowing

- `createAPIClient` options: `url`, `apiKey`, `headers`, `fetch`, `logger`, `maxBatchSize` (max 50, `1` disables batching), `batchIntervalMs`, `logBatches`, `retry` (bool or `RetryOptions`), `rateLimit` (requests per minute, default 200 with an API key, 100 without), and in 0.4.0 `voidInputProcedures`.
- Retries default to 3 attempts with jittered exponential backoff on 408, 409, 425, 429, 500, 502, 503, 504. `retry.onRetry` is how `client.ts` feeds the loading indicator.
- Calls made in the same tick are batched into one HTTP request. Oversized batches are split automatically. Do not add your own batching.
- Every request shares one API key budget and the client's rate limiter. Never bypass the client with a raw `fetch`.
- Pagination: pass `autoPaginate: true` and the call returns an `AsyncIterableIterator<{ items, cursor }>`. The SDK also accepts `maxPages` and `cursorEnd: Date` in the same input. `collectPages` in `warera-api.ts` adds a page cap and warning on top. Cursors look like `"{isoDate}|{id}"`. Known cursor-paginated procedures: `article.getArticlesPaginated`, `battle.getBattles`, `company.getCompanies`, `event.getEventsPaginated`, `mu.getManyPaginated`, `transaction.getPaginatedTransactions`, `user.getUsersByCountry`, `workOffer.getWorkOffersPaginated`. Other `*Paginated` procedures added in 0.4.0 may also work; check the response type for `nextCursor` first.
- `contribution.*` endpoints use one-based `page` input with a fixed 10 rows per page, not cursors.
- The client is a proxy: any `apiClient.<router>.<procedure>(input)` path is sent as a tRPC query, typed or not. To call an endpoint missing from the types with full typing, add it to `CustomEndpoints` in `client.ts`, which is passed to `apiClient._ce<...>()`. This keeps batching, retries and rate limiting. Nothing is registered today. Check that the live API still answers the path before adding one: game updates remove procedures without an SDK release (`company.getRecommendedRegionIds` went away in v0.27).
- Procedures with a `z.void()` server schema reject `{}`. The SDK sends no input for the ones it knows (`VOID_INPUT_PROCEDURES`, currently `gameStat.getWorldDevelopment`); list extra ones in `voidInputProcedures`.
- `worker.getWorkers` needs `companyId`, `userId` or both and returns a discriminated union on `type`. `election.getElections` needs `countryId`, `partyId` or both. `upgradeConstruction.listConstructions` needs `regionId`, `countryId` or both. `sanction.getPaginated.type` is uppercase (`BAN`, `MUTE_USER`).
- `work.*` stats procedures need a Premium API key (HTTP 403 otherwise).
- Endpoint explorer with live responses: https://warera.realmarijn.nl/api-explorer. OpenAPI spec: https://api2.warera.io/openapi.json. SDK source: https://github.com/WarEraProjects/TRPC.

## Caching and refresh

- Global QueryClient (`src/functions/react-query-setup.ts`): 1 hour stale time, 5 minute gc, 5 retries, `offlineFirst`.
- Manual refresh bumps `useRefreshStore.epoch`, which is part of every query key, so everything active refetches.
- `PersistedDataProvider` gives a route its own QueryClient persisted to IndexedDB with 24 hour stale time. Use only for immutable, expensive, staleness-tolerant data. Bump `VITE_QUERY_CACHE_BUSTER` when the persisted shape changes.

## Checklist for a new endpoint

1. Find the procedure in `references/procedures.md`. If it is not there, check the API explorer and the SDK version delta.
2. Add the hook in `warera-api.ts` with one of the recipes above. Choose `maxPages` deliberately for paginated calls.
3. Map the response type in `src/api/types.ts` only if the UI needs literal unions the SDK does not provide.
4. Consume it from a page or a `src/hooks/game/` hook. Never from `apiClient` directly.
5. Run `npm run tsc && npm run lint && npm run format:check`.
6. Update `docs/api-layer.md` if you changed a rule, a safeguard or the file layout.

## References

- `references/procedures.md`: every procedure in the SDK, which ones the app uses, which are new in 0.4.0.
- `references/sdk-upgrade.md`: 0.3.2 to 0.4.0 delta and the upgrade procedure.
- `scripts/list-procedures.sh`: regenerate the procedure list from the installed package.
