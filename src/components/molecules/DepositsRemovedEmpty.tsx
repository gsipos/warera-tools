import { PickaxeIcon } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty'

export const DepositsRemovedEmpty = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <PickaxeIcon />
      </EmptyMedia>
      <EmptyTitle>No deposits</EmptyTitle>
      <EmptyDescription>
        WarEra removed region deposits in game version 0.27 (October 2026), so no region has one anymore.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)
