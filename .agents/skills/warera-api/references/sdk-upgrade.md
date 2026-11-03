# Upgrading `@wareraprojects/api`

Installed: 0.3.2 (`package.json` range `^0.3.2`). Latest on npm: 0.4.0, published 2026-10-08. No changelog is published; the delta below was produced by diffing the two packages' `dist/index.d.ts`.

## What 0.4.0 adds

New routers: `alliance`, `contribution`, `countryDiplomacy`, `giveaway`, `sanction`, `shop`, `upgradeConstruction`, `war`.

New procedures on existing routers: `article.getWelcomeArticleByCountryId`, `country.getUnrestData`, `election.getElection`, `gameStat.getWorldDevelopment`, `region.getAll`, `search.searchMus`, `search.searchUsers`, `tournament.getById`, `tournament.getManyPaginated`, `work.getStatsByWorker`.

Client changes:

- `voidInputProcedures` option and exported `VOID_INPUT_PROCEDURES` set. Procedures with a `z.void()` schema now receive no input instead of `{}`.
- `worker.getWorkers` input and response are overridden to a discriminated union (`type: 'company' | 'user'`).
- Many new exported types (`Alliance*`, `Contribution*`, `Sanction*`, `War*`, ...). No exported type was removed, so existing imports in `src/api/types.ts` keep compiling.

Procedures the app uses today are all present and unchanged in name: `country.getAllCountries`, `region.getRegionsObject`, `itemTrading.getPrices`, `tradingOrder.getTopOrders`, `user.getUserLite`, `user.getUsersByCountry`, `inventory.fetchCurrentEquipment`, `company.getById`, `company.getCompanies`, `workOffer.getWorkOfferByCompanyId`, `workOffer.getWorkOffersPaginated`, `transaction.getPaginatedTransactions`.

Still missing from the types in 0.4.0: `company.getRecommendedRegionIds` (by `companyId`), which the app registers as a custom endpoint in `src/api/client.ts`. The typed sibling is `company.getRecommendedRegionIdsByItemCode`.

## Upgrade procedure

1. Confirm the release is at least 7 days old (`npm view @wareraprojects/api time`). 0.4.0 already is.
2. Pin the exact version and refresh the lockfile:

   ```bash
   npm install --legacy-peer-deps --save-exact @wareraprojects/api@0.4.0
   ```

3. Run `npm run tsc`. Expect failures only where `src/api/types.ts` narrows an SDK type whose shape changed; fix the `Omit<...> & {...}` mapping rather than widening with `any`.
4. Check `CustomEndpoints` in `src/api/client.ts`. Remove any entry whose procedure the new SDK version now types, and update the hook if the SDK's input or output shape differs from the hand-written one.
5. Done: `company.getRecommendedRegionIds` is registered through `apiClient._ce<CustomEndpoints>()` and `rawTrpcFetch` no longer exists. Nothing to do here unless a release types that procedure (see step 4).

6. Bump `VITE_QUERY_CACHE_BUSTER` in `.env` if any persisted response shape changed.
7. Run `npm run lint && npm run format:check && npm run build` and smoke test the pages that use the touched hooks (`/users/:id`, `/countries/:id`, `/itemMarket`).
8. Regenerate `procedures.md` with `scripts/list-procedures.sh` and update this file's installed version.
