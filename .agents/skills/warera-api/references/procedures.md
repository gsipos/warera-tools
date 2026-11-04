# WarEra API procedures

Generated from `@wareraprojects/api` 0.4.0 type definitions on 2026-11-03 with `scripts/list-procedures.sh`. 0.4.0 is the installed version; procedures marked **new** were added by it (see `sdk-upgrade.md`).

Legend: **used** = wrapped by a hook in `src/api/warera-api.ts`; **paginated** = supports `autoPaginate`; **new** = added between 0.3.2 and 0.4.0.

## alliance

- `alliance.getById` — new
- `alliance.getByIds` — new
- `alliance.getManyPaginated` — new

## article

- `article.getArticleById`
- `article.getArticleLiteById`
- `article.getArticlesPaginated` — paginated
- `article.getWelcomeArticleByCountryId` — new

## battle

- `battle.getBattles` — paginated
- `battle.getById`
- `battle.getLiveBattleData`

## battleLootSummary

- `battleLootSummary.getByBattleAndUser`

## battleOrder

- `battleOrder.getByBattle`

## battleRanking

- `battleRanking.getRanking`

## company

- `company.getById` — used
- `company.getCompanies` — used, paginated
- `company.getProductionBonus`
- `company.getRecommendedRegionIdsByItemCode`

## contribution

- `contribution.getCountryUnrestContributions` — new
- `contribution.getRegionContributions` — new

## country

- `country.getAllCountries` — used
- `country.getCountryById`
- `country.getUnrestData` — new

## countryDiplomacy

- `countryDiplomacy.getByCountry` — new

## donation

- `donation.getManyPaginated`
- `donation.getTotalDonations`

## election

- `election.getElection` — new
- `election.getElections`

## event

- `event.getEventsPaginated` — paginated

## gameConfig

- `gameConfig.getDates`
- `gameConfig.getGameConfig`

## gameStat

- `gameStat.getEquipmentAvgByCode`
- `gameStat.getWorldDevelopment` — new

## giveaway

- `giveaway.getManyPaginated` — new

## government

- `government.getByCountryId`

## inventory

- `inventory.fetchCurrentEquipment` — used

## itemOffer

- `itemOffer.getById`

## itemTrading

- `itemTrading.getPrices` — used

## mercenaryContractAuction

- `mercenaryContractAuction.getPaginatedAuctions`

## mu

- `mu.getById`
- `mu.getManyPaginated` — paginated

## muMember

- `muMember.getByMu`

## party

- `party.getById`
- `party.getManyPaginated`

## ranking

- `ranking.getRanking`

## region

- `region.getAll` — new
- `region.getById`
- `region.getRegionsObject` — used

## round

- `round.getById`
- `round.getLastHits`

## sanction

- `sanction.getPaginated` — new

## search

- `search.searchAnything`
- `search.searchMus` — new
- `search.searchUsers` — new

## shop

- `shop.getLastGifts` — new
- `shop.getSubscribedUsers` — new
- `shop.getTopGiftGivers` — new

## tournament

- `tournament.getById` — new
- `tournament.getLastTournament`
- `tournament.getManyPaginated` — new

## tournamentTeam

- `tournamentTeam.getById`
- `tournamentTeam.getByTournamentId`

## tradingOrder

- `tradingOrder.getPublicOrdersByOwner`
- `tradingOrder.getTopOrders` — used

## transaction

- `transaction.getPaginatedTransactions` — used, paginated

## upgrade

- `upgrade.getUpgradeByTypeAndEntity`

## upgradeConstruction

- `upgradeConstruction.getMapConstructions` — new
- `upgradeConstruction.getRegionConstructions` — new
- `upgradeConstruction.listConstructions` — new

## user

- `user.getUserById`
- `user.getUserLite` — used
- `user.getUsersByCountry` — used, paginated

## war

- `war.getById` — new

## work

- `work.getStatsByCompany`
- `work.getStatsByUserId`
- `work.getStatsByWorker` — new
- `work.getStatsByWorkerAndCompany`

## workOffer

- `workOffer.getById`
- `workOffer.getWageStats`
- `workOffer.getWorkOfferByCompanyId` — used
- `workOffer.getWorkOffersPaginated` — used, paginated

## worker

- `worker.getTotalWorkersCount`
- `worker.getWorkers`

## Not in the SDK types

- `company.getRecommendedRegionIds` (input `{ companyId, includeDeposit }`) — **used** through `rawTrpcFetch`. The SDK only types the sibling `company.getRecommendedRegionIdsByItemCode` (input `{ itemCode, includeDeposit }`). Register the companyId variant through `apiClient._ce<...>()` to get batching and retries back.
