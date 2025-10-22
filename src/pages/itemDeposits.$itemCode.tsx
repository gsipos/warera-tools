import { RegionPageTemplate } from '@/components/templates/RegionPageTemplate'
import { useExtendedRegions } from '@/hooks/game/use-extended-region'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/itemDeposits/$itemCode')({
  component: ItemDepositsPage,
})

function ItemDepositsPage() {
  const { itemCode } = Route.useParams()
  const regions = useExtendedRegions()

  let diplayedRegions = regions
    .filter((r) => r.region.deposit)
    .filter((r) => r.region.deposit.type === itemCode)
    .toSorted(
      (a, b) => b.country?.rankings.countryProductionBonus.value! - a.country?.rankings.countryProductionBonus.value!,
    )

  return <RegionPageTemplate regions={diplayedRegions} pageTitle={`Deposits of ${itemCode}`} />
}
