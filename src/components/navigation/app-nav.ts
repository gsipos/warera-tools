/**
 * Navigation item structure used throughout the app
 */
export interface NavItem {
  title: string
  href: string
  description: string
}

/**
 * Navigation group structure containing a label and items
 */
export interface NavGroup {
  groupTitle: string
  links: NavItem[]
}

/**
 * Map navigation links: Countries, Regions, Alliances
 */
export const mapLinks: NavItem[] = [
  {
    title: 'Countries',
    href: '/countries',
    description: 'List of all countries.',
  },
  {
    title: 'Regions',
    href: '/regions',
    description: 'List of all regions.',
  },
  {
    title: 'Alliances',
    href: '/countries/alliances',
    description: 'Chart of all alliances.',
  },
]

/**
 * Analysis navigation links
 */
export const analysisLinks: NavItem[] = [
  {
    title: 'Item Production bonuses',
    href: '/item/production',
    description: 'Analyze production bonuses and optimal locations for each item.',
  },
]

/**
 * Market navigation links
 */
export const marketLinks: NavItem[] = [
  {
    title: 'Item Market',
    href: '/itemMarket',
    description: 'Item Market analysis and prices.',
  },
]

/**
 * All navigation groups for the main app navigation
 */
export const navigationGroups: NavGroup[] = [
  {
    groupTitle: 'Map',
    links: mapLinks,
  },
  {
    groupTitle: 'Analysis',
    links: analysisLinks,
  },
  {
    groupTitle: 'Market',
    links: marketLinks,
  },
]
