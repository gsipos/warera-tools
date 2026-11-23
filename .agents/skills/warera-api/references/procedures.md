# WarEra API procedures

Generated from `@wareraprojects/api` 0.5.0 type definitions on 2026-11-23 with `scripts/list-procedures.sh`. The app has 0.5.0 installed. The list includes the SDK-packaged custom endpoints (the `*CustomEndpoints` types), which the default client also exposes.

Legend: **used** = wrapped by a hook in `src/api/warera-api.ts`; **paginated** = supports `autoPaginate` (the input has a `cursor` field); **new** = added between 0.4.0 and 0.5.0 (see `sdk-upgrade.md`).

## alliance

- `alliance.getById`
- `alliance.getByIds`
- `alliance.getManyPaginated` — paginated
- `alliance.getStrategicResourceBonuses` — new

## article

- `article.getArticleById`
- `article.getArticleLiteById`
- `article.getArticlesPaginated` — paginated
- `article.getPinnedArticles` — new
- `article.getWelcomeArticleByCountryId`

## articleInteraction

- `articleInteraction.getArticleDislikers` — new
- `articleInteraction.getArticleGemTippers` — new
- `articleInteraction.getArticleLikers` — new
- `articleInteraction.getArticleTippers` — new

## assetSale

- `assetSale.getLastSkinGifts` — new

## battle

- `battle.getActiveBattlesByCountry` — new
- `battle.getBattles` — paginated
- `battle.getById`
- `battle.getLiveBattleData`
- `battle.getViewersCount` — new

## battleLootSummary

- `battleLootSummary.getByBattleAndUser`

## battleOrder

- `battleOrder.getByBattle`

## battleRanking

- `battleRanking.getRanking` — paginated

## company

- `company.getById` — used
- `company.getCompanies` — used, paginated
- `company.getProductionBonus` — used. Since game v0.27 (2026-10-26) the live response is only `{ depositBonus, total }`; 0.5.0 types only those two fields, both `@deprecated`.
- `company.getRecommendedRegionIdsByItemCode` — dead: answers 200 with an empty array for every item code since v0.27 removed deposits and country specialization. Still typed in 0.5.0, marked `@deprecated`.

## contribution

- `contribution.getCountryUnrestContributions`
- `contribution.getRegionContributions`

## country

- `country.getAllCountries` — used
- `country.getCountryById`
- `country.getStrategicResourceBonuses` — new
- `country.getUnrestData`

## countryDiplomacy

- `countryDiplomacy.getByCountry`

## donation

- `donation.getManyPaginated` — paginated
- `donation.getTotalDonations`

## election

- `election.getElection`
- `election.getElections` — paginated

## employee

- `employee.getById` — new
- `employee.getCompanyEmployees` — new
- `employee.getCompanyEstimate` — new
- `employee.getCompanyRoster` — new
- `employee.getManagerPointValue` — new
- `employee.getMyEmployees` — new
- `employee.getMyWorkforceSummary` — new

## employeeEvent

- `employeeEvent.getHistory` — new
- `employeeEvent.getMine` — new
- `employeeEvent.getPendingCount` — new

## event

- `event.getEventsPaginated` — paginated

## gameConfig

- `gameConfig.getDates`
- `gameConfig.getGameConfig`
- `gameConfig.getMaxBountyRate` — new

## gameStat

- `gameStat.getBadgeStats` — new
- `gameStat.getEquipmentAvgByCode`
- `gameStat.getMilestoneStats` — new
- `gameStat.getPpMoneyValue` — new
- `gameStat.getPpMoneyValueByItem` — new
- `gameStat.getWorldDevelopment`

## giveaway

- `giveaway.getManyPaginated` — paginated

## government

- `government.getByCountryId`
- `government.getCongressSeats` — new

## inventory

- `inventory.fetchCurrentEquipment` — used

## itemOffer

- `itemOffer.getById`

## itemTrading

- `itemTrading.getItemTrading` — new
- `itemTrading.getPrices` — used

## manager

- `manager.getByCompanyId` — new

## managerOffer

- `managerOffer.getByCompanyId` — new
- `managerOffer.getManyPaginated` — new, paginated
- `managerOffer.getWageStats` — new

## map

- `map.getMapData` — new

## mercenaryContractAuction

- `mercenaryContractAuction.getActiveAuctions` — new, paginated
- `mercenaryContractAuction.getPaginatedAuctions` — paginated

## mu

- `mu.getById`
- `mu.getManyPaginated` — paginated
- `mu.getReputationBuyStatus` — new

## muMember

- `muMember.getByMu`

## party

- `party.getById`
- `party.getInactiveMemberIds` — new
- `party.getManyPaginated` — paginated

## poll

- `poll.getPoll` — new
- `poll.getPollVoters` — new, paginated

## ranking

- `ranking.getRanking`

## region

- `region.getAll`
- `region.getById`
- `region.getRegionsObject` — used

## round

- `round.getById`
- `round.getLastHits`

## sanction

- `sanction.getPaginated` — paginated

## search

- `search.searchAnything`
- `search.searchMus`
- `search.searchUsers`

## shop

- `shop.getLastGifts`
- `shop.getSubscribedUsers`
- `shop.getTopGiftGivers`

## tournament

- `tournament.getById`
- `tournament.getLastTournament`
- `tournament.getManyPaginated` — paginated

## tournamentTeam

- `tournamentTeam.getById`
- `tournamentTeam.getByTournamentId`

## tradingOrder

- `tradingOrder.getPublicOrdersByOwner`
- `tradingOrder.getTopOrders` — used
- `tradingOrder.getTopOrdersPerItemCode` — new

## transaction

- `transaction.getPaginatedTransactions` — used, paginated

## upgrade

- `upgrade.getMapUpgrades` — new
- `upgrade.getUpgradeByTypeAndEntity`

## upgradeConstruction

- `upgradeConstruction.getMapConstructions`
- `upgradeConstruction.getRegionConstructions`
- `upgradeConstruction.listConstructions` — paginated

## user

- `user.getTodayClaimCount` — new. Not the key owner's count: the same number with and without an API key.
- `user.getUserById`
- `user.getUserLite` — used. No longer returns `skills` or `skillsExpiration`; use `user.getUserSkills`.
- `user.getUserSkills` — used, new. Answers without an API key.
- `user.getUsersByCountry` — used, paginated

## war

- `war.getById`

## work

- `work.getStatsByCompany`
- `work.getStatsByUserId`

## Removed in 0.5.0

- `workOffer.getById`, `workOffer.getWageStats`, `workOffer.getWorkOfferByCompanyId`, `workOffer.getWorkOffersPaginated`. The whole router is gone; the live API returns 404 for it since game v0.27. The app no longer calls any of them.
- `worker.getTotalWorkersCount`, `worker.getWorkers`, `work.getStatsByWorker`, `work.getStatsByWorkerAndCompany`. The API no longer serves them (the old work system was removed in game v0.27).

## Removed from the live API

- `company.getRecommendedRegionIds` (input `{ companyId, includeDeposit }`) — answers tRPC `NOT_FOUND` since game v0.27 (2026-10-26). It was never in the SDK types; the app registered it as a custom endpoint until the companies card switched to `company.getProductionBonus`. Nothing is registered through `apiClient._ce<...>()` today.

## Response fields the game removed in v0.27

0.5.0 no longer declares `country.specializedItem`, `country.rankings.countryProductionBonus` or `region.deposit`. `src/api/types.ts` adds them back as optional, so the app still compiles while it reads them. Keep them optional until the app stops reading them.
