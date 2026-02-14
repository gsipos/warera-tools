import { Separator } from '@radix-ui/react-separator'
import { RefreshCwIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { SimpleTooltip } from '../ui/tooltip'
import { useQueryClient } from '@tanstack/react-query'
import { NetworkHealth } from '../molecules/NetworkHealth'
import { SidebarTrigger } from '../ui/sidebar'

export const RefreshDataButton = () => {
  const queryClient = useQueryClient()

  const handleRefresh = async () => {
    await queryClient.invalidateQueries()
  }

  return (
    <SimpleTooltip tooltip="Refresh Data">
      <Button onClick={handleRefresh} size="icon-sm" variant="ghost">
        <RefreshCwIcon />
      </Button>
    </SimpleTooltip>
  )
}



export const AppHeader = () => {
  return (
    <>
      <div className="flex flex-row items-center justify-between gap-4 p-2">
        {/* Hamburger menu - mobile only */}
        <div className="md:hidden">
          <SidebarTrigger className="size-11" />
        </div>

        {/* Branding */}
        <h1 className="flex flex-row items-center gap-2 text-lg font-bold">
          <img src="/app/logo-500.png" alt="War Era Tools" className="aspect-square h-8 w-8 object-contain" />
          <span className="hidden sm:inline">War Era Tools</span>
        </h1>

        {/* Spacer to push status indicators to the right */}
        <div className="flex shrink-1 grow-1" />

        {/* Status indicators and actions */}
        <div className="flex flex-row gap-1">
          <NetworkHealth />
          <RefreshDataButton />
        </div>
      </div>
      <Separator className="my-2" />
    </>
  )
}

