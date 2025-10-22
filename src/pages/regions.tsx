import { RegionPageTemplate } from '@/components/templates/RegionPageTemplate'
import { useExtendedRegions } from '@/hooks/game/use-extended-region'
import { createFileRoute } from '@tanstack/react-router'

const RegionsPage = () => {
  const regions = useExtendedRegions()

  return <RegionPageTemplate regions={regions} pageTitle={'All Regions'} />
}

export const Route = createFileRoute('/regions')({
  component: RegionsPage,
})
