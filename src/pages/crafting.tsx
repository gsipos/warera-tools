import { crafingRecipes } from '@/api/warera-item-recipes'
import { useTradingTopOrders } from '@/api/warera-api'
import { useWarEraApiBatchQuery } from '@/api/warera-api-framework'
import { armorTypes, weaponsCodes } from '@/api/warera-api-schema'
import { ItemImage } from '@/components/atoms/ItemImage'
import { Money } from '@/components/molecules/Money'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { aggregateTransactions } from '@/hooks/use-item-market-price'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { WarEra } from 'warera-api'

export const Route = createFileRoute('/crafting')({
  component: CraftingPage,
})

const LEVELS = [6, 5, 4, 3, 2, 1] as const
type Level = (typeof LEVELS)[number]

const FIXED_SLOTS = ['helmet', 'chest', 'gloves', 'pants', 'weapon', 'boots'] as const
type FixedSlot = (typeof FIXED_SLOTS)[number]

type RecipeKey = `random-${Level}` | `fixed-${Level}-${FixedSlot}`

const rarityLabel = (level: Level) => {
  switch (level) {
    case 1:
      return 'Common'
    case 2:
      return 'Uncommon'
    case 3:
      return 'Rare'
    case 4:
      return 'Epic'
    case 5:
      return 'Legendary'
    case 6:
      return 'Mythic'
  }
}

const titleCase = (value: string) => value.slice(0, 1).toUpperCase() + value.slice(1)

const clamp0 = (value: number) => Math.max(0, value)

const getEquipmentCodeForFixedCraft = (level: Level, slot: FixedSlot): WarEra.EquipmentCode => {
  if (slot === 'weapon') {
    const weaponCode = weaponsCodes[level - 1]
    if (!weaponCode) {
      throw new Error(`Invalid weapon level: ${level}`)
    }
    return weaponCode
  }

  if (!armorTypes.includes(slot as (typeof armorTypes)[number])) {
    throw new Error(`Invalid armor slot: ${slot}`)
  }

  return `${slot}${level}` as WarEra.ArmorCode
}

const getEquipmentCodesForRandomCraft = (level: Level): WarEra.EquipmentCode[] => {
  return FIXED_SLOTS.map((slot) => getEquipmentCodeForFixedCraft(level, slot))
}

function CraftingPage() {
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({})

  const scrapOrdersQuery = useTradingTopOrders('scraps')
  const steelOrdersQuery = useTradingTopOrders('steel')

  const scrapTopSellPrice = scrapOrdersQuery.data?.sellOrders?.[0]?.price
  const steelTopSellPrice = steelOrdersQuery.data?.sellOrders?.[0]?.price

  const perCraftCost = (scrapQty: number, steelQty: number) => {
    if (scrapQty === 0 && steelQty === 0) return 0

    if (scrapQty > 0 && typeof scrapTopSellPrice !== 'number') return undefined
    if (steelQty > 0 && typeof steelTopSellPrice !== 'number') return undefined

    const scrapCost = scrapQty * (scrapTopSellPrice ?? 0)
    const steelCost = steelQty * (steelTopSellPrice ?? 0)

    return scrapCost + steelCost
  }

  const fixedRecipeByLevel = useMemo(() => {
    const map = new Map<Level, { scrap: number; steel: number }>()
    for (const level of LEVELS) {
      const recipe = crafingRecipes.find((r) => r.type === 'fixed' && r.level === level)
      map.set(level, { scrap: recipe?.scrap ?? 0, steel: recipe?.steel ?? 0 })
    }
    return map
  }, [])

  const randomRecipeByLevel = useMemo(() => {
    const map = new Map<Level, { scrap: number; steel: number }>()
    for (const level of LEVELS) {
      const recipe = crafingRecipes.find((r) => r.type === 'random' && r.level === level)
      map.set(level, { scrap: recipe?.scrap ?? 0, steel: recipe?.steel ?? 0 })
    }
    return map
  }, [])

  const fixedCards = useMemo(() => {
    return LEVELS.flatMap((level) =>
      FIXED_SLOTS.map((slot) => {
        const key: RecipeKey = `fixed-${level}-${slot}`
        const cost = fixedRecipeByLevel.get(level) ?? { scrap: 0, steel: 0 }
        return { key, level, slot, cost }
      }),
    )
  }, [fixedRecipeByLevel])

  const randomCards = useMemo(() => {
    return LEVELS.map((level) => {
      const key: RecipeKey = `random-${level}`
      const cost = randomRecipeByLevel.get(level) ?? { scrap: 0, steel: 0 }
      return { key, level, cost }
    })
  }, [randomRecipeByLevel])

  const outcomeEquipmentCodes = useMemo(() => {
    const codes = new Set<WarEra.EquipmentCode>()
    for (const level of LEVELS) {
      for (const slot of FIXED_SLOTS) {
        codes.add(getEquipmentCodeForFixedCraft(level, slot))
      }
    }
    return Array.from(codes)
  }, [])

  const outcomeTransactionsFirstPage = useWarEraApiBatchQuery<WarEra.Paginated<WarEra.Transaction>>(
    useMemo(
      () =>
        outcomeEquipmentCodes.map((itemCode) => ({
          endpoint: 'transaction.getPaginatedTransactions',
          input: {
            limit: 50,
            transactionType: 'itemMarket',
            itemCode,
          } satisfies WarEra.TransactionOptions,
        })),
      [outcomeEquipmentCodes],
    ),
  )

  const marketStatsByEquipmentCode = useMemo(() => {
    const byCode = new Map<WarEra.EquipmentCode, { avgPrice?: number; txCount: number }>()
    const pages = outcomeTransactionsFirstPage.data

    outcomeEquipmentCodes.forEach((code, i) => {
      const page = pages[i]
      const txList = page?.items ?? []
      const groups = aggregateTransactions(txList)

      const txCount = groups.reduce((sum, g) => sum + g.count, 0)
      const weightedSum = groups.reduce((sum, g) => sum + g.avg * g.count, 0)
      const avgPrice = txCount > 0 ? Math.round(weightedSum / txCount) : undefined
      const stats = avgPrice === undefined ? { txCount } : { avgPrice, txCount }
      byCode.set(code, stats)
    })

    return byCode
  }, [outcomeEquipmentCodes, outcomeTransactionsFirstPage.data])

  const totals = useMemo(() => {
    let totalCrafts = 0
    let totalScrap = 0
    let totalSteel = 0

    for (const card of fixedCards) {
      const count = selectedCounts[card.key] ?? 0
      if (count <= 0) continue
      totalCrafts += count
      totalScrap += card.cost.scrap * count
      totalSteel += card.cost.steel * count
    }

    for (const card of randomCards) {
      const count = selectedCounts[card.key] ?? 0
      if (count <= 0) continue
      totalCrafts += count
      totalScrap += card.cost.scrap * count
      totalSteel += card.cost.steel * count
    }

    return { totalCrafts, totalScrap, totalSteel }
  }, [selectedCounts, fixedCards, randomCards])

  const costToMe = useMemo(() => {
    const { totalScrap, totalSteel } = totals

    if (totalScrap === 0 && totalSteel === 0) return 0

    if (totalScrap > 0 && typeof scrapTopSellPrice !== 'number') return undefined
    if (totalSteel > 0 && typeof steelTopSellPrice !== 'number') return undefined

    const scrapCost = totalScrap * (scrapTopSellPrice ?? 0)
    const steelCost = totalSteel * (steelTopSellPrice ?? 0)

    return scrapCost + steelCost
  }, [totals, scrapTopSellPrice, steelTopSellPrice])

  const changeCount = (key: RecipeKey, delta: number) => {
    setSelectedCounts((prev) => {
      const next = clamp0((prev[key] ?? 0) + delta)
      if (next === 0) {
        const { [key]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [key]: next }
    })
  }

  return (
    <div className="flex flex-col gap-4 p-2">
      <h1 className="text-2xl font-bold">Crafting</h1>

      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row flex-wrap items-center gap-3">
            <Badge variant="outline">Crafts: {totals.totalCrafts}</Badge>
            {totals.totalScrap > 0 ? (
              <Badge variant="outline" className="flex flex-row items-center gap-1">
                <ItemImage itemCode="scraps" className="h-4 w-4" />
                <span>{totals.totalScrap}</span>
              </Badge>
            ) : null}
            {totals.totalSteel > 0 ? (
              <Badge variant="outline" className="flex flex-row items-center gap-1">
                <ItemImage itemCode="steel" className="h-4 w-4" />
                <span>{totals.totalSteel}</span>
              </Badge>
            ) : null}
            <div className="flex flex-row items-center gap-2">
              <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                <ItemImage itemCode="scraps" className="h-4 w-4" />
                <span>Unit:</span>
              </span>
              {typeof scrapTopSellPrice === 'number' ? (
                <Money amount={scrapTopSellPrice} />
              ) : (
                <Badge variant="outline">—</Badge>
              )}
            </div>
            <div className="flex flex-row items-center gap-2">
              <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                <ItemImage itemCode="steel" className="h-4 w-4" />
                <span>Unit:</span>
              </span>
              {typeof steelTopSellPrice === 'number' ? (
                <Money amount={steelTopSellPrice} />
              ) : (
                <Badge variant="outline">—</Badge>
              )}
            </div>
            <div className="flex flex-row items-center gap-2">
              <span className="text-muted-foreground text-sm">Cost to me:</span>
              {typeof costToMe === 'number' ? <Money amount={costToMe} /> : <Badge variant="outline">—</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Random</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {randomCards.map((card) => {
            const count = selectedCounts[card.key] ?? 0
            const rarity = rarityLabel(card.level)
            const rollLine = 'Rolls any: Helmet, Chest, Gloves, Pants, Weapon, Boots'
            const craftCost = perCraftCost(card.cost.scrap, card.cost.steel)

            const randomOutcomeCodes = getEquipmentCodesForRandomCraft(card.level)
            const randomOutcomeAvgs = randomOutcomeCodes.map((code) => marketStatsByEquipmentCode.get(code)?.avgPrice)
            const hasAllAvgs = randomOutcomeAvgs.every((v) => typeof v === 'number')

            const profitability =
              typeof craftCost === 'number' && hasAllAvgs
                ? (() => {
                    const profits = (randomOutcomeAvgs as number[]).map((avg) => avg - craftCost)
                    const profitableCount = profits.filter((p) => p > 0).length
                    const expectedProfit = Math.round(profits.reduce((a, b) => a + b, 0) / profits.length)
                    const profitablePct = Math.round((profitableCount / profits.length) * 100)
                    return { profitableCount, profitablePct, expectedProfit }
                  })()
                : undefined

            return (
              <Card key={card.key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">{rarity} Random</CardTitle>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="h-6 w-6"
                      onClick={() => changeCount(card.key, -1)}
                      aria-label={`Remove random level ${card.level}`}
                    >
                      -
                    </Button>

                    <Badge variant="outline" className="w-10 justify-center tabular-nums">
                      {count}
                    </Badge>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="h-6 w-6"
                      onClick={() => changeCount(card.key, +1)}
                      aria-label={`Add random level ${card.level}`}
                    >
                      +
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground mb-2 text-xs leading-tight">{rollLine}</div>
                  <div className="text-muted-foreground flex flex-row flex-wrap items-center gap-2 text-sm">
                    {card.cost.scrap > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <ItemImage itemCode="scraps" className="h-4 w-4" />
                        <span>{card.cost.scrap}</span>
                      </span>
                    ) : null}
                    {card.cost.steel > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <ItemImage itemCode="steel" className="h-4 w-4" />
                        <span>{card.cost.steel}</span>
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-row items-center gap-2">
                    <span className="text-muted-foreground text-sm">Cost:</span>
                    {typeof craftCost === 'number' ? <Money amount={craftCost} /> : <Badge variant="outline">—</Badge>}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Profitable:{' '}
                    {profitability ? (
                      <>
                        {profitability.profitableCount}/6 ({profitability.profitablePct}%) • E[profit]:{' '}
                        <Money amount={profitability.expectedProfit} /> (equal odds)
                      </>
                    ) : (
                      <>
                        — • E[profit]: <Badge variant="outline">—</Badge> (equal odds)
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Fixed</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {fixedCards.map((card) => {
            const count = selectedCounts[card.key] ?? 0
            const rarity = rarityLabel(card.level)
            const slotLabel = titleCase(card.slot)
            const craftCost = perCraftCost(card.cost.scrap, card.cost.steel)

            const outcomeCode = getEquipmentCodeForFixedCraft(card.level, card.slot)
            const avgPrice = marketStatsByEquipmentCode.get(outcomeCode)?.avgPrice
            const profit =
              typeof avgPrice === 'number' && typeof craftCost === 'number' ? avgPrice - craftCost : undefined

            return (
              <Card key={card.key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">
                    {rarity} {slotLabel}
                  </CardTitle>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="h-6 w-6"
                      onClick={() => changeCount(card.key, -1)}
                      aria-label={`Remove fixed ${slotLabel} level ${card.level}`}
                    >
                      -
                    </Button>

                    <Badge variant="outline" className="w-10 justify-center tabular-nums">
                      {count}
                    </Badge>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="h-6 w-6"
                      onClick={() => changeCount(card.key, +1)}
                      aria-label={`Add fixed ${slotLabel} level ${card.level}`}
                    >
                      +
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground flex flex-row flex-wrap items-center gap-2 text-sm">
                    {card.cost.scrap > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <ItemImage itemCode="scraps" className="h-4 w-4" />
                        <span>{card.cost.scrap}</span>
                      </span>
                    ) : null}
                    {card.cost.steel > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <ItemImage itemCode="steel" className="h-4 w-4" />
                        <span>{card.cost.steel}</span>
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-row items-center gap-2">
                    <span className="text-muted-foreground text-sm">Cost:</span>
                    {typeof craftCost === 'number' ? <Money amount={craftCost} /> : <Badge variant="outline">—</Badge>}
                  </div>
                  <div className="mt-1 flex flex-row flex-wrap items-center gap-2">
                    <span className="text-muted-foreground text-sm">Avg:</span>
                    {typeof avgPrice === 'number' ? <Money amount={avgPrice} /> : <Badge variant="outline">—</Badge>}
                    <span className="text-muted-foreground text-sm">Profit:</span>
                    {typeof profit === 'number' ? <Money amount={profit} /> : <Badge variant="outline">—</Badge>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
