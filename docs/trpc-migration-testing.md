# tRPC Migration - Manual Testing Checklist

## Overview

This document covers manual testing after the migration from direct API calls to the `@wareraprojects/api` tRPC client package. All API calls now go through `src/api/client.ts` using the shared `apiClient` instance.

## Validation Results

- **Lint (`npm run lint`):** ✅ Pass (0 errors, 56 warnings — all pre-existing)
- **Build (`npm run build`):** ✅ Pass (production bundle built successfully)

---

## Pages to Test

### 1. Home / Index (`/`)

- [ ] Page loads without errors
- [ ] Dashboard summary data displays correctly
- [ ] Navigation links work

### 2. Countries List (`/countries`)

- [ ] Country list loads and renders
- [ ] Country flags and names display correctly
- [ ] Sorting/filtering works if available

### 3. Country Dashboard (`/countries/$countryId`)

- [ ] Individual country data loads
- [ ] Economic indicators display
- [ ] Resource/production data renders
- [ ] Charts display correctly (echarts)

### 4. Country Matchup (`/countries/matchup`)

- [ ] Comparison tool loads
- [ ] Can select two countries
- [ ] Comparison data renders correctly

### 5. Country Alliances (`/countries/alliances`)

- [ ] Alliance list loads
- [ ] Member countries display

### 6. Item Market (`/itemMarket`)

- [ ] Market data loads
- [ ] Item prices display
- [ ] Trading top orders render (ItemMarketDetails component)

### 7. Item Production (`/item/production`)

- [ ] Production data loads
- [ ] Recipe/crafting info displays

### 8. Item Deposits (`/itemDeposits/$itemCode`)

- [ ] Deposit locations load
- [ ] Map/list of deposits renders

### 9. Items List (`/items`)

- [ ] Full item catalog loads
- [ ] Item details accessible

### 10. Deposits Index (`/deposits`)

- [ ] Deposit overview loads
- [ ] Filtering works

### 11. Crafting (`/crafting`)

- [ ] Crafting recipes load
- [ ] Calculator/planner works

### 12. Regions (`/regions`)

- [ ] Region list loads
- [ ] Region details accessible

### 13. User Profile (`/users/$userId`)

- [ ] User data loads
- [ ] Profile information displays
- [ ] User stats render

---

## Key Functionality to Verify

### API Client

- [ ] All API calls succeed (no 401/403/500 errors in console)
- [ ] Request batching works (multiple calls consolidated)
- [ ] Rate limiting retry indicator shows when throttled
- [ ] Loading states display during data fetches

### Data Persistence (IndexedDB)

- [ ] Data persists across page reloads
- [ ] Stale data shows while fresh data loads (stale-while-revalidate)
- [ ] Cache invalidation works correctly

### Error Handling

- [ ] Network errors show user-friendly messages
- [ ] React Error Boundary catches component failures
- [ ] Retry logic works on transient failures

### Performance

- [ ] Initial page load is responsive
- [ ] Navigation between pages is smooth
- [ ] No unnecessary re-fetches on navigation

---

## Expected Behavior After Migration

1. **No functional changes** — all features work identically to pre-migration
2. **Improved type safety** — TypeScript errors caught at compile time via tRPC schema
3. **Better error handling** — automatic retries with exponential backoff
4. **Request batching** — multiple API calls automatically batched by tRPC

---

## Known Issues & Limitations

1. **Bundle size warning** — Single JS chunk exceeds 500 kB (2030 kB). Consider code-splitting with dynamic imports in a future phase.
2. **Lint warnings (56)** — Pre-existing unused variable warnings. Not related to migration.
3. **`vaul` package unused** — The `vaul` (drawer) dependency is installed but not imported anywhere in application code. Can be safely removed.
4. **Some shadcn/ui components unused** — Components like `calendar`, `carousel`, `chart`, `command`, `input-otp`, `resizable` exist only as UI primitives not yet used in pages. They can be kept for future use or removed to reduce bundle size.
5. **`recharts` vs `echarts`** — Both charting libraries are installed. `recharts` is only referenced in the shadcn chart component stub. Active charts use `echarts`. Consider removing `recharts` if not needed.

---

## Potentially Removable Dependencies

| Package                  | Reason                                                        |
| ------------------------ | ------------------------------------------------------------- |
| `vaul`                   | Not imported anywhere in src/                                 |
| `recharts`               | Only in unused shadcn chart stub; active charts use `echarts` |
| `react-day-picker`       | Only in unused calendar component                             |
| `embla-carousel-react`   | Only in unused carousel component                             |
| `input-otp`              | Only in unused input-otp component                            |
| `cmdk`                   | Only in unused command component                              |
| `react-resizable-panels` | Only in unused resizable component                            |
| `next-themes`            | Only in sonner toast (may be needed if dark mode is used)     |

> **Note:** These shadcn/ui stub components are commonly kept for future use. Removal is optional and depends on project plans.
