---
name: new-dashboard-page
description: Add a new page, route, navigation entry, card or chart to the warera-tools dashboard. Use when asked for a new view, report, chart, table or tool page, or when wiring an existing data hook into the UI. Covers TanStack Router file routes, nav registration, ECharts via useEcharts, shadcn card layouts and the persisted-data decision.
---

# New dashboard page

Pages are TanStack Router file routes in `src/pages/`. Routing, nav and data each have one place to go.

## Steps

1. **Data first.** Find or add the hook in `src/api/warera-api.ts` (see the `warera-api` skill). Put joins and aggregations in `src/hooks/game/use-<thing>.ts` returning plain data, so the page stays declarative.
2. **Route file.** Create `src/pages/<segment>.tsx` (or `<parent>.<child>.tsx` for nesting, `$param` for params) and export `Route = createFileRoute('/<path>')({ component })`. The dev server regenerates `src/routeTree.gen.ts`; commit it. Do not hand-edit it.
3. **Route-local components** go in `src/pages/<segment>/-molecules/` or `-organisms/`. The `-` prefix keeps them out of the route tree. Promote to `src/components/` only when a second page needs them.
4. **Navigation.** Add a `NavItem` to the right group in `src/components/navigation/app-nav.ts`. Links use the router `Link` component, never `<a href>`.
5. **Layout.** Reuse the responsive grid the existing pages use: `grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 p-2`, with shadcn `Card` for each block. Look at `src/pages/users.$userId.tsx` and `src/components/organisms/User*Card.tsx` for the pattern.
6. **Loading.** Hooks report to the global `LoadingIndicator` automatically. For a page that cannot render without its main entity, return `<AppSplashScreen />` until `data` exists; otherwise render the frame and let cards fill in.
7. **Charts.** Build an `EChartsOption` in `useMemo` and pass it to `useEcharts(config)`; attach the returned ref to a sized `div`. `src/components/organisms/CountryAllianceChart.tsx` and `HeatMapChart.tsx` are good templates. Prefer ECharts for new charts; Recharts remains only in older components.
8. **Formatting helpers.** Money and numbers go through `src/functions/number-formats.ts` and the `Money` molecule. Dates use Luxon.
9. **Persistence.** Wrap the route in `PersistedDataProvider` only when it loads large immutable history (transactions). Everything else uses the default QueryClient.
10. **Verify.** `npm run tsc && npm run lint && npm run format:check`, then open the page on `http://localhost:3001` and check it with and without data. Use the `chrome-devtools` or `web-design-reviewer` skill for a visual pass when the change is layout-heavy.

## Conventions that bite

- `exactOptionalPropertyTypes` is on: pass `undefined` explicitly only when the prop type allows it, and spread conditionally (`...(x ? { x } : {})`).
- `noUncheckedIndexedAccess` is on: index results are `T | undefined`; narrow before use.
- React Compiler is on: write plain components and let it memoize. Reach for `useMemo` only for expensive derivations such as chart options.
- Item, weapon and armor code lists come from `src/api/warera-api-schema.ts`; do not hardcode them in pages.
- Country flags: `CountryFlag` molecule. User and country links: `UserNavLink` and `CountryNavLink`.
