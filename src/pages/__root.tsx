import { AppFooter } from '@/components/organisms/AppFooter'
import { AppHeader } from '@/components/organisms/AppHeader'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const RootLayout = () => (
  <>
    <AppHeader />

    <Outlet />
    <TanStackRouterDevtools />

    <AppFooter />
  </>
)

export const Route = createRootRoute({ component: RootLayout })
