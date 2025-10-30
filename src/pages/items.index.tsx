import { useTopProdBonusCountry } from '@/hooks/game/use-top-prod-bonus'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/items/')({
  component: ItemIndexPage,
})

function ItemIndexPage() {
  const topProdBonusCountry = useTopProdBonusCountry()

  return (
    <div>
      <h1>Items</h1>
    </div>
  )
}
