import { AppFooter } from '@/components/organisms/AppFooter'
import { AppHeader } from '@/components/organisms/AppHeader'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const RootLayout = () => (
  <div className="flex min-h-screen flex-col">
    <AppHeader />

    <Outlet />
    <TanStackRouterDevtools />

    <div className="flex-grow" />

    <AppFooter />
  </div>
)

export const Route = createRootRoute({ component: RootLayout })
