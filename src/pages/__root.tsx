import { AppFooter } from '@/components/organisms/AppFooter'
import { AppHeader } from '@/components/organisms/AppHeader'
import { AppSidebarNav } from '@/components/organisms/AppSidebarNav'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const RootLayout = () => (
  <SidebarProvider>
    <AppSidebarNav />
    <SidebarInset>
      <AppHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
      <AppFooter />
    </SidebarInset>
  </SidebarProvider>
)

export const Route = createRootRoute({ component: RootLayout })
