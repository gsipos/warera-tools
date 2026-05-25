import { craftingRecipes } from '@/api/warera-item-recipes'
import { useTradingTopOrders } from '@/api/warera-api'
import { armorLevels, armorTypes, weaponsCodes } from '@/api/warera-api-schema'
import { ItemImage } from '@/components/atoms/ItemImage'
import { Money } from '@/components/molecules/Money'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { aggregateTransactions, useEquipmentTransactions } from '@/hooks/use-item-market-price'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { WarEra } from '@/api/types'
import { DateTime } from 'luxon'
import { moneyFormat, percentFormat } from '@/functions/number-formats'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { backgroundVariants, ItemBackground } from '@/components/atoms/ItemBackground'
import { TimeRangeSelect } from '@/components/molecules/TimeRangeSelect'
import { useDateRangeStore } from '@/stores/date-range-store'

export const Route = createFileRoute('/crafting')({
  component: CraftingPage,
})

const LEVELS = armorLevels.toReversed()
type Level = WarEra.ArmorLevel

const FIXED_SLOTS = ['helmet', 'chest', 'gloves', 'pants', 'weapon', 'boots'] as const
type FixedSlot = (typeof FIXED_SLOTS)[number]

type RecipeKey = `random-${Level}` | `fixed-${Level}-${FixedSlot}`

const rarytyLabel: Record<Level, string> = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Epic',
  5: 'Legendary',
  6: 'Mythic',
}

const rarityLabel = (level: Level) => rarytyLabel[level]

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

const useCraftCost = (scrapQty: number, steelQty: number) => {
  const scrapOrdersQuery = useTradingTopOrders('scraps')
  const steelOrdersQuery = useTradingTopOrders('steel')

  const scrapTopSellPrice = scrapOrdersQuery.data?.sellOrders?.[0]?.price
  const steelTopSellPrice = steelOrdersQuery.data?.sellOrders?.[0]?.price

  const scrapCost = scrapQty * (scrapTopSellPrice ?? 0)
  const steelCost = steelQty * (steelTopSellPrice ?? 0)

  return scrapCost + steelCost
}

const toSum = (a: number, b: number) => a + b

const useProfitability = (eqCode: WarEra.EquipmentCode, craftCost: number) => {
  const fromDate = useDateRangeStore((state) => state.startDate)
  const { txGroups, txList } = useEquipmentTransactions(eqCode, fromDate)

  const profitabilityGroups = txGroups.map((g) => ({
    avg: g.avg - craftCost,
    min: g.min - craftCost,
    max: g.max - craftCost,
  }))

  const avgProfitability = profitabilityGroups.filter((p) => p.avg > 0).length / profitabilityGroups.length
  const minProfitability = profitabilityGroups.filter((p) => p.min > 0).length / profitabilityGroups.length
  const maxProfitability = profitabilityGroups.filter((p) => p.max > 0).length / profitabilityGroups.length

  const avgProfit = profitabilityGroups.map((p) => p.avg).reduce(toSum, 0) / profitabilityGroups.length
  const minProfit = profitabilityGroups.map((p) => p.min).reduce(toSum, 0) / profitabilityGroups.length
  const maxProfit = profitabilityGroups.map((p) => p.max).reduce(toSum, 0) / profitabilityGroups.length

  return {
    avgProfitability,
    minProfitability,
    maxProfitability,
    avgProfit,
    minProfit,
    maxProfit,
    count: txList?.length ?? 0,
  }
}

type Profitability = ReturnType<typeof useProfitability>

const useProfitabilitySummary = (profits: Profitability[]): Profitability => {
  return {
    avgProfitability: profits.map((p) => p.avgProfitability).reduce(toSum, 0) / profits.length,
    minProfitability: profits.map((p) => p.minProfitability).reduce(toSum, 0) / profits.length,
    maxProfitability: profits.map((p) => p.maxProfitability).reduce(toSum, 0) / profits.length,
    avgProfit: profits.map((p) => p.avgProfit).reduce(toSum, 0) / profits.length,
    minProfit: profits.map((p) => p.minProfit).reduce(toSum, 0) / profits.length,
    maxProfit: profits.map((p) => p.maxProfit).reduce(toSum, 0) / profits.length,
    count: profits.map((p) => p.count).reduce(toSum, 0),
  }
}

const useRandomProfitability = (level: Level, craftCost: number) => {
  const weapon = useProfitability(weaponsCodes[level - 1] as WarEra.EquipmentCode, craftCost)
  const helmet = useProfitability(getEquipmentCodeForFixedCraft(level, 'helmet'), craftCost)
  const chest = useProfitability(getEquipmentCodeForFixedCraft(level, 'chest'), craftCost)
  const gloves = useProfitability(getEquipmentCodeForFixedCraft(level, 'gloves'), craftCost)
  const pants = useProfitability(getEquipmentCodeForFixedCraft(level, 'pants'), craftCost)
  const boots = useProfitability(getEquipmentCodeForFixedCraft(level, 'boots'), craftCost)

  return useProfitabilitySummary([weapon, helmet, chest, gloves, pants, boots])
}

interface FixedRecipeCardProps {
  count: number
  onCountChange: (newCount: number) => void

  level: Level
  slot: FixedSlot

  scrapQty: number
  steelQty: number
}

const ProfitLabel = ({ value }: { value: number }) => (
  <span className={cn(value > 0 ? 'text-green-500' : 'text-red-500')}>{moneyFormat.format(value)}</span>
)

const FixedRecipeCard = (props: FixedRecipeCardProps) => {
  const craftCost = useCraftCost(props.scrapQty, props.steelQty)

  const count = props.count ?? 0
  const rarity = rarityLabel(props.level)
  const slotLabel = titleCase(props.slot)

  const outcomeCode = getEquipmentCodeForFixedCraft(props.level, props.slot)

  const profit = useProfitability(outcomeCode, craftCost)

  return (
    <Card className={cn(backgroundVariants({ level: props.level }))}>
      <CardHeader className="flex flex-col items-center justify-between space-y-0">
        <ItemBackground level={props.level} className="size-12 shrink-0">
          <ItemImage itemCode={outcomeCode} className="size-12" />
        </ItemBackground>

        <CardTitle className="text-sm font-medium">
          {rarity} {slotLabel}
        </CardTitle>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="h-6 w-6"
            onClick={() => props.onCountChange(props.count - 1)}
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
            onClick={() => props.onCountChange(props.count + 1)}
          >
            +
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground flex flex-row flex-wrap items-center justify-between gap-1 text-sm">
          <span className="inline-flex items-center gap-1">
            <ItemImage itemCode="scraps" className="h-4 w-4" />
            <span>{props.scrapQty}</span>
          </span>

          <span className="inline-flex items-center gap-1">
            <ItemImage itemCode="steel" className="h-4 w-4" />
            <span>{props.steelQty}</span>
          </span>

          <Money amount={craftCost} />
        </div>

        <Separator className="my-1" />
        <span className="text-muted-foreground w-full text-center text-sm">Profitability ({profit.count} tx)</span>
        <div className="text-muted-foreground flex w-full flex-row justify-between text-sm">
          <span> worst</span>
          <span> avg</span>
          <span> best</span>
        </div>

        <div className="text-muted-foreground flex w-full flex-row justify-between text-sm">
          <span>{percentFormat.format(profit.minProfitability)}</span>
          <span>{percentFormat.format(profit.avgProfitability)}</span>
          <span>{percentFormat.format(profit.maxProfitability)}</span>
        </div>

        <div className="flex w-full flex-row justify-between">
          <ProfitLabel value={profit.minProfit} />
          <ProfitLabel value={profit.avgProfit} />
          <ProfitLabel value={profit.maxProfit} />
        </div>
      </CardContent>
    </Card>
  )
}

interface RandomRecipeCardProps {
  level: Level

  count: number
  onCountChange: (newCount: number) => void

  scrapQty: number
  steelQty: number
}
const RandomRecipeCard = (props: RandomRecipeCardProps) => {
  const craftCost = useCraftCost(props.scrapQty, props.steelQty)

  const count = props.count ?? 0
  const rarity = rarityLabel(props.level)

  const profit = useRandomProfitability(props.level, craftCost)

  return (
    <Card className={cn(backgroundVariants({ level: props.level }))}>
      <CardHeader className="flex flex-col items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Random {rarity}</CardTitle>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="h-6 w-6"
            onClick={() => props.onCountChange(props.count - 1)}
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
            onClick={() => props.onCountChange(props.count + 1)}
          >
            +
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground flex flex-row flex-wrap items-center justify-between gap-1 text-sm">
          <span className="inline-flex items-center gap-1">
            <ItemImage itemCode="scraps" className="h-4 w-4" />
            <span>{props.scrapQty}</span>
          </span>

          <span className="inline-flex items-center gap-1">
            <ItemImage itemCode="steel" className="h-4 w-4" />
            <span>{props.steelQty}</span>
          </span>

          <Money amount={craftCost} />
        </div>

        <Separator className="my-1" />
        <span className="text-muted-foreground w-full text-center text-sm">Profitability ({profit.count} tx)</span>
        <div className="text-muted-foreground flex w-full flex-row justify-between text-sm">
          <span> worst</span>
          <span> avg</span>
          <span> best</span>
        </div>

        <div className="text-muted-foreground flex w-full flex-row justify-between text-sm">
          <span>{percentFormat.format(profit.minProfitability)}</span>
          <span>{percentFormat.format(profit.avgProfitability)}</span>
          <span>{percentFormat.format(profit.maxProfitability)}</span>
        </div>

        <div className="flex w-full flex-row justify-between">
          <ProfitLabel value={profit.minProfit} />
          <ProfitLabel value={profit.avgProfit} />
          <ProfitLabel value={profit.maxProfit} />
        </div>
      </CardContent>
    </Card>
  )
}

function CraftingPage() {
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({})

  const scrapOrdersQuery = useTradingTopOrders('scraps')
  const steelOrdersQuery = useTradingTopOrders('steel')

  const scrapTopSellPrice = scrapOrdersQuery.data?.sellOrders?.[0]?.price
  const steelTopSellPrice = steelOrdersQuery.data?.sellOrders?.[0]?.price

  const fixedRecipeByLevel = useMemo(() => {
    const map = new Map<Level, { scrap: number; steel: number }>()
    for (const level of LEVELS) {
      const recipe = craftingRecipes.find((r) => r.type === 'fixed' && r.level === level)
      map.set(level, { scrap: recipe?.scrap ?? 0, steel: recipe?.steel ?? 0 })
    }
    return map
  }, [])

  const randomRecipeByLevel = useMemo(() => {
    const map = new Map<Level, { scrap: number; steel: number }>()
    for (const level of LEVELS) {
      const recipe = craftingRecipes.find((r) => r.type === 'random' && r.level === level)
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
        <CardContent className="flex flex-col">
          <div className="flex flex-row flex-wrap items-center justify-start gap-3">
            <TimeRangeSelect />
            <div className="flex flex-row items-center gap-2">
              <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                <ItemImage itemCode="scraps" className="h-4 w-4" />
                <span>Scraps:</span>
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
                <span>Steel:</span>
              </span>

              <Money amount={steelTopSellPrice ?? 0} />
            </div>
            <Badge variant="outline">Crafts: {totals.totalCrafts}</Badge>
            <div className="flex flex-row flex-wrap items-start gap-2">
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
                <span className="text-muted-foreground text-sm">Cost to me:</span>
                {typeof costToMe === 'number' ? <Money amount={costToMe} /> : <Badge variant="outline">—</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Random</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {randomCards.map((c) => (
            <RandomRecipeCard
              key={c.key}
              level={c.level}
              count={selectedCounts[c.key] ?? 0}
              onCountChange={(newCount) => changeCount(c.key, newCount - (selectedCounts[c.key] ?? 0))}
              scrapQty={c.cost.scrap}
              steelQty={c.cost.steel}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Fixed</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {fixedCards.map((c) => (
            <FixedRecipeCard
              key={c.key}
              count={selectedCounts[c.key] ?? 0}
              onCountChange={(newCount) => changeCount(c.key, newCount - (selectedCounts[c.key] ?? 0))}
              level={c.level}
              slot={c.slot}
              scrapQty={c.cost.scrap}
              steelQty={c.cost.steel}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
