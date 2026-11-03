# Upgrading `@wareraprojects/api`

Installed: 0.4.0, pinned exactly in `package.json` (upgraded from 0.3.2 on 2026-11-03). No changelog is published; the delta below was produced by diffing the two packages' `dist/index.d.ts`.

## `@trpc/server` must be a direct dependency

`@trpc/client` imports `@trpc/server/observable` at runtime and pins `@trpc/server` as a peer at the same patch version. SDK 0.3.2 declared that peer itself; 0.4.0 does not, and `npm ci --legacy-peer-deps` never installs peers. Without a direct dependency the Vite build fails with `Rollup failed to resolve import "@trpc/server/observable"`. Keep `@trpc/server` in `package.json` at exactly the version `@trpc/client` requires (`npm view @trpc/client@<version> peerDependencies`) and bump it whenever an SDK upgrade changes the client version.

## What 0.4.0 added over 0.3.2

New routers: `alliance`, `contribution`, `countryDiplomacy`, `giveaway`, `sanction`, `shop`, `upgradeConstruction`, `war`.

New procedures on existing routers: `article.getWelcomeArticleByCountryId`, `country.getUnrestData`, `election.getElection`, `gameStat.getWorldDevelopment`, `region.getAll`, `search.searchMus`, `search.searchUsers`, `tournament.getById`, `tournament.getManyPaginated`, `work.getStatsByWorker`.

Client changes:

- `voidInputProcedures` option and exported `VOID_INPUT_PROCEDURES` set. Procedures with a `z.void()` schema now receive no input instead of `{}`.
- `worker.getWorkers` input and response are overridden to a discriminated union (`type: 'company' | 'user'`).
- Many new exported types (`Alliance*`, `Contribution*`, `Sanction*`, `War*`, ...). No exported type was removed, so existing imports in `src/api/types.ts` kept compiling and the upgrade needed no source changes.
- The package no longer declares peer dependencies (see the `@trpc/server` note above).

Procedures the app uses are all present and unchanged in name: `country.getAllCountries`, `region.getRegionsObject`, `itemTrading.getPrices`, `tradingOrder.getTopOrders`, `user.getUserLite`, `user.getUsersByCountry`, `inventory.fetchCurrentEquipment`, `company.getById`, `company.getCompanies`, `workOffer.getWorkOfferByCompanyId`, `workOffer.getWorkOffersPaginated`, `transaction.getPaginatedTransactions`.

Still missing from the types in 0.4.0: `company.getRecommendedRegionIds` (by `companyId`), which the app calls through `rawTrpcFetch`. The typed sibling is `company.getRecommendedRegionIdsByItemCode`. Migrating that call to `apiClient._ce<...>()` (step 5 below) is still open.

## Upgrade procedure

1. Check for a newer release and confirm it is at least 7 days old: `npm view @wareraprojects/api version time`.
2. Pin the exact version and refresh the lockfile:

   ```bash
   npm install --legacy-peer-deps --save-exact @wareraprojects/api@<version>
   ```

3. Run `npm ls @trpc/client @trpc/server`. If the client version changed, pin `@trpc/server` to the version it now requires with the same `npm install --legacy-peer-deps --save-exact` command.
4. Run `npm run tsc`. Expect failures only where `src/api/types.ts` narrows an SDK type whose shape changed; fix the `Omit<...> & {...}` mapping rather than widening with `any`.
5. Grep for `rawTrpcFetch` and replace any call whose procedure is now typed with the typed client. If `company.getRecommendedRegionIds` is still untyped, it can be registered as a custom endpoint so it gets batching, retries and rate limiting:

   ```ts
   type CustomEndpoints = {
     'company.getRecommendedRegionIds': {
       input: { companyId: string; includeDeposit: boolean }
       output: WarEra.RecommendedRegionForCompany[]
     }
   }
   export const apiClient = createAPIClient({ ... })._ce<CustomEndpoints>()
   ```

   Once no raw call remains, delete `rawTrpcFetch` and update the `docs/api-layer.md` sections that describe it.

6. Bump `VITE_QUERY_CACHE_BUSTER` in `.env` if any persisted response shape changed.
7. Run `npm run lint && npm run format:check && npm run build` and smoke test the pages that use the touched hooks (`/users/:id`, `/countries/:id`, `/itemMarket`).
8. Regenerate `procedures.md` with `scripts/list-procedures.sh`, diff it against the previous list, and update the installed version at the top of this file and in `procedures.md`.
