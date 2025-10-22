import { RegionPageTemplate } from '@/components/templates/RegionPageTemplate'
import { useExtendedRegions } from '@/hooks/game/use-extended-region'
import { createFileRoute } from '@tanstack/react-router'

const DepositsPage = () => {
  const regions = useExtendedRegions()

  let diplayedRegions = regions
    .filter((r) => r.region.deposit)
    .toSorted(
      (a, b) => b.country?.rankings.countryProductionBonus.value! - a.country?.rankings.countryProductionBonus.value!,
    )

  return <RegionPageTemplate regions={diplayedRegions} pageTitle={'All Deposits'} />
}

export const Route = createFileRoute('/deposits/')({
  component: DepositsPage,
})
