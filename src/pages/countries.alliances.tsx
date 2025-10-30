import { CountryAllianceChart } from '@/components/organisms/CountryAllianceChart'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/countries/alliances')({
  component: CountryAlliancesPage,
})

function CountryAlliancesPage() {
  return (
    <div className="flex h-full flex-grow flex-col">
      <h1>Country Alliances</h1>
      <CountryAllianceChart className="h-full min-h-[600px] flex-grow" />
    </div>
  )
}
