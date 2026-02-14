import { Link } from '@tanstack/react-router'
import {
  MapIcon,
  GlobeIcon,
  FlagIcon,
  ShoppingCartIcon,
  FactoryIcon,
  StarIcon,
  PackageIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useFavouriteState } from '@/hooks/use-favourite-state'
import { UserNavLink } from '@/components/molecules/UserNavLink'
import { CountryNavLink } from '@/components/molecules/CountryNavLink'
import { mapLinks, marketLinks, depositLinks } from '@/components/navigation/app-nav'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function AppSidebarNav() {
  const { setOpenMobile, isMobile } = useSidebar()
  const favouriteState = useFavouriteState()
  const [depositsOpen, setDepositsOpen] = useState(false)

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const users = favouriteState.favourites.filter((f) => f.type === 'user')
  const countries = favouriteState.favourites.filter((f) => f.type === 'country')
  const hasFavourites = users.length > 0 || countries.length > 0

  return (
    <Sidebar>
      {/* Header: WarEra Tools branding */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" onClick={handleNavClick}>
              <Link to="/">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="/app/logo-500.png" alt="WarEra Tools" className="size-6 object-contain" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">WarEra Tools</span>
                  <span className="text-xs">Game Analytics</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Primary Navigation: Map & Territory */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <MapIcon className="mr-2 size-4 shrink-0" />
            <span className="truncate">Map & Territory</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link
                    to="/countries"
                    activeProps={{
                      className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                    }}
                  >
                    <FlagIcon />
                    <span>Countries</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link
                    to="/regions"
                    activeProps={{
                      className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                    }}
                  >
                    <GlobeIcon />
                    <span>Regions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link
                    to="/countries/alliances"
                    activeProps={{
                      className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                    }}
                  >
                    <FlagIcon />
                    <span>Alliances</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Primary Navigation: Market */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <ShoppingCartIcon className="mr-2 size-4 shrink-0" />
            <span className="truncate">Market</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link
                    to="/itemMarket"
                    activeProps={{
                      className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                    }}
                  >
                    <ShoppingCartIcon />
                    <span>Item Market</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Primary Navigation: Analysis */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <FactoryIcon className="mr-2 size-4 shrink-0" />
            <span className="truncate">Analysis</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link
                    to="/item/production"
                    activeProps={{
                      className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                    }}
                  >
                    <FactoryIcon />
                    <span>Item Production</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Secondary Navigation: Favourites */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <StarIcon className="mr-2 size-4 shrink-0" />
            <span className="truncate">Favourites</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {hasFavourites ? (
              <SidebarMenu>
                {countries.map((favourite) => (
                  <SidebarMenuItem key={favourite.id}>
                    <CountryNavLink countryId={favourite.id} onNavigate={handleNavClick} />
                  </SidebarMenuItem>
                ))}
                {users.map((favourite) => (
                  <SidebarMenuItem key={favourite.id}>
                    <UserNavLink userId={favourite.id} onNavigate={handleNavClick} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <div className="text-muted-foreground px-4 py-2 text-sm">No favourites added</div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation: Deposits (Collapsible) */}
        <Collapsible open={depositsOpen} onOpenChange={setDepositsOpen} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="w-full">
                <PackageIcon className="mr-2 size-4 shrink-0" />
                <span className="flex-1 truncate">Deposits</span>
                {depositsOpen ? (
                  <ChevronDownIcon className="ml-auto size-4 shrink-0 transition-transform" />
                ) : (
                  <ChevronRightIcon className="ml-auto size-4 shrink-0 transition-transform" />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild onClick={handleNavClick}>
                      <Link
                        to="/deposits"
                        activeProps={{
                          className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                        }}
                      >
                        <PackageIcon />
                        <span>All Deposits</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {/* Specific deposit types in a submenu */}
                  <SidebarMenuSub>
                    {depositLinks.slice(2).map((link) => (
                      <SidebarMenuSubItem key={link.href}>
                        <SidebarMenuSubButton asChild onClick={handleNavClick}>
                          <Link
                            to={link.href}
                            activeProps={{
                              className: 'bg-sidebar-accent text-sidebar-accent-foreground',
                            }}
                          >
                            <span className="truncate">{link.title.replace('Deposit: ', '')}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      {/* Footer: Utilities */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild onClick={handleNavClick}>
              <Link to="/">
                <HomeIcon />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
