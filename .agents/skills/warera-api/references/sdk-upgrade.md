# Upgrading `@wareraprojects/api`

Installed: 0.5.0 (exact pin in `package.json`). Latest on npm: 0.5.0, published 2026-11-13. 0.4.0 was published 2026-10-08. The package ships a `CHANGELOG.md`; the 0.4.0 → 0.5.0 facts below were also checked against `dist/index.d.ts` and `dist/index.js`.

## 0.4.0 → 0.5.0

Procedures: 41 new and 8 removed (see `procedures.md`). New routers: `articleInteraction`, `assetSale`, `employee`, `employeeEvent`, `manager`, `managerOffer`, `map` and `poll`. Removed routers: `workOffer` and `worker`.

Client:

- `@trpc/client` and `@trpc/server` 11.24.0 are now direct dependencies, pinned exactly. 0.4.0 depended on `@trpc/client` ^10.45.2 only.
- Without an explicit `rateLimit` option, the client follows the server's `ratelimit-policy` header. It starts at 200 requests/min with an API key and 100 without; 0.4.0 kept that rate fixed. The changelog says the server then allows 500/min with an API key.
- HTTP 409 is no longer retried by default. The default retryable codes are 408, 425, 429, 500, 502, 503 and 504.
- Queries still go out as POST. They now use tRPC's `methodOverride: "POST"` instead of the SDK's own GET-to-POST wrapper.

Removed:

- The whole `workOffer.*` router. The live API returns 404 for it since game v0.27.
- `worker.getTotalWorkersCount`, `worker.getWorkers`, `work.getStatsByWorker` and `work.getStatsByWorkerAndCompany`.
- The types `RegionDeposit` and `WorkOfferListItem`. The changelog lists other removed and renamed types, for example `CompanyDates`, `PartyEthics` and `MuGetByIdResponse` (now `MuListItem`).

Response shapes:

- `user.getUserLite` no longer returns `skills` or `skillsExpiration`. The app fetches `user.getUserSkills` alongside it (`useUserWithSkills` and `useAllUsersWithSkills` in `src/api/warera-api.ts`).
- `UserSkills` lost `entrepreneurship`.
- `allies` is optional on `CountryListItem` (`country.getAllCountries`); it was required in 0.4.0. `country.getCountryById` still requires it.
- `company.getProductionBonus` types only `depositBonus` and `total`, both `@deprecated`.
- Deposit fields are `@deprecated`, for example `GameConfigRegion.depositsEnabled`. Deposits left the game in v0.27.

## Upgrade procedure

1. Install the exact version: `npm install --legacy-peer-deps @wareraprojects/api@<version>`. The repo's `.npmrc` sets `min-release-age=7` (days) and `save-exact=true`, so npm refuses a version published less than 7 days ago, even when named exactly, and saves an exact pin. Check publish dates with `npm view @wareraprojects/api time`. Commit `package.json` and `package-lock.json` together.
2. Read the installed `node_modules/@wareraprojects/api/CHANGELOG.md`, then run `npm run tsc`. Expect failures only where `src/api/types.ts` narrows an SDK type whose shape changed; fix the `Omit<...> & {...}` mapping rather than widening with `any`.
3. Check the custom endpoints registered in `src/api/client.ts` (none today). Remove any entry whose procedure the new SDK version now types, and update the hook if the SDK's input or output shape differs from the hand-written one.
4. Compare the installed types against the live API for the fields `src/api/types.ts` marks optional (listed in `procedures.md`). Keep them optional until the app stops reading them.
5. Bump `VITE_QUERY_CACHE_BUSTER` in `.env` if any persisted response shape changed.
6. Run `npm run tsc && npm run lint && npm run format:check && npm run build`, then smoke test the pages that use the touched hooks (`/users/:id`, `/countries/:id`, `/itemMarket`).
7. Regenerate `procedures.md` with `scripts/list-procedures.sh` and update the installed version at the top of this file.

## 0.3.2 → 0.4.0 (history)

No changelog was published for 0.4.0. The delta below was produced by diffing the two packages' `dist/index.d.ts`.

New routers: `alliance`, `contribution`, `countryDiplomacy`, `giveaway`, `sanction`, `shop`, `upgradeConstruction`, `war`.

New procedures on existing routers: `article.getWelcomeArticleByCountryId`, `country.getUnrestData`, `election.getElection`, `gameStat.getWorldDevelopment`, `region.getAll`, `search.searchMus`, `search.searchUsers`, `tournament.getById`, `tournament.getManyPaginated`, `work.getStatsByWorker`.

Client changes:

- `voidInputProcedures` option and exported `VOID_INPUT_PROCEDURES` set. Procedures with a `z.void()` schema now receive no input instead of `{}`.
- `worker.getWorkers` input and response are overridden to a discriminated union (`type: 'company' | 'user'`).
- Many new exported types (`Alliance*`, `Contribution*`, `Sanction*`, `War*`, ...). No exported type was removed, so existing imports in `src/api/types.ts` keep compiling.

Procedures the app used at the time are all present and unchanged in name: `country.getAllCountries`, `region.getRegionsObject`, `itemTrading.getPrices`, `tradingOrder.getTopOrders`, `user.getUserLite`, `user.getUsersByCountry`, `inventory.fetchCurrentEquipment`, `company.getById`, `company.getCompanies`, `workOffer.getWorkOfferByCompanyId`, `workOffer.getWorkOffersPaginated`, `transaction.getPaginatedTransactions`.

No procedure the app used is missing from the 0.4.0 types. `company.getRecommendedRegionIds` was removed from the live API in game v0.27 and is no longer called; `procedures.md` lists the response fields that update removed as well.
