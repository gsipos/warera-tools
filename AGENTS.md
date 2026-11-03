# warera-tools — agent instructions

Dashboard and analysis tools for the browser game [warera.io](https://warera.io). A public, client-only React SPA deployed to Vercel on every push to `main`. This is a hobby project: prefer the smallest, simplest change that works.

This file is the single source of project instructions for every coding agent (Claude Code, Copilot, Codex, Cursor, ...). Harness-specific files should only point here.

## Stack

| Area       | Choice                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Runtime    | Node 22.12 (`.nvmrc`), npm, Vite 7                                                               |
| UI         | React 19 with the React Compiler enabled (do not hand-memoize unless profiling shows a need)     |
| Language   | TypeScript strict, plus `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`              |
| Routing    | TanStack Router, file-based routes in `src/pages/`, generated `src/routeTree.gen.ts` (committed) |
| Data       | `@wareraprojects/api` (typed tRPC client for `api2.warera.io`) + TanStack Query v5               |
| State      | Zustand for the few global stores (`src/stores/`)                                                |
| Styling    | Tailwind v4 + shadcn/ui components in `src/components/ui/`                                       |
| Charts     | ECharts via `useEcharts` (preferred); some older charts use Recharts                             |
| Dates      | Luxon (preferred); `date-fns` only where shadcn calendar needs it                                |
| Validation | Zod                                                                                              |

## Commands

```bash
npm ci --legacy-peer-deps   # install (CI uses the same flag)
npm start                   # dev server on http://localhost:3001
npm run tsc                 # type check
npm run lint                # oxlint
npm run format              # prettier --write (format:check in CI)
npm run build               # production build
```

CI (`.github/workflows/web-app-build.yml`) runs `tsc`, `format:check`, `lint` and `build` on every push. Run all four before pushing. There is no test runner yet; `npm test` fails by design.

Environment: `.env` holds `VITE_WARERA_DEFAULT_API_KEY` and `VITE_QUERY_CACHE_BUSTER`. It is committed on purpose because `VITE_` values are public build-time constants. Never put a secret in it. Bump the cache buster when a persisted response shape changes.

## Layout

| Path                                   | What lives there                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/api/`                             | The only place that talks to the WarEra API. `warera-api.ts` exports every data hook.     |
| `src/hooks/game/`                      | Hooks that derive game-domain data from the API hooks (aggregations, joins, time boxing). |
| `src/hooks/`                           | Generic hooks (`use-async-resource`, `use-echarts`, `use-loading-state`, ...).            |
| `src/pages/`                           | Route files. Folders starting with `-` hold route-local components, not routes.           |
| `src/components/ui/`                   | shadcn/ui primitives. Generated; edit only to fix a bug.                                  |
| `src/components/atoms..templates/`     | App components by atomic-design level. New shared components go here.                     |
| `src/components/navigation/app-nav.ts` | Sidebar navigation groups. Register new pages here.                                       |
| `src/stores/`                          | Zustand stores (`date-range-store`, `refresh-store`).                                     |
| `src/persistence/`                     | Opt-in IndexedDB-backed QueryClient for immutable historical data.                        |
| `src/functions/`                       | Pure helpers (arrays, number formats, user utils, React Query setup).                     |
| `docs/`                                | Long-form architecture docs. `docs/api-layer.md` is required reading for data work.       |
| `.agents/skills/`                      | Agent skills (see below).                                                                 |

## Data layer rules

1. Every API call is a hook exported from `src/api/warera-api.ts`. Pages and components never import `apiClient` directly.
2. Single query: `useAsyncResource(queryKey, fn)`. Many ids: `useBatchAsyncResource`. Paginated: `collectPages(..., maxPages)` with an explicit page cap.
3. Prefer the typed client over `rawTrpcFetch`. The raw helper is a stopgap with no batching, retry or rate limiting.
4. Wrap a route in `PersistedDataProvider` only for immutable, expensive, staleness-tolerant data (for example transaction history).
5. Before adding or changing a hook, read the `warera-api` skill. It documents the SDK surface, the version delta, and the hook recipes.

## Conventions

- **Simplicity first.** Fewer moving parts beats enterprise robustness. No new abstractions, layers or libraries without an immediate need.
- **TypeScript everywhere.** Explicit prop and function types. No `any`; use `unknown` and narrow.
- **Small components.** One clear responsibility per component; split a file when it grows past that.
- **Stock shadcn/ui.** Use the existing primitives with their default styling. Compose primitives before building custom UI. Keep Tailwind utilities, no custom CSS.
- **Variants with `cva`.** Only when a component has real reusable variants. Export the variants next to the component and derive props with `VariantProps`.
- **Zustand stores** in `src/stores/`, kebab-case file names. Separate state and action interfaces, an `initialState` object, and a `reset` action. No middleware without a need.
- **Testable logic.** Keep meaningful logic in pure functions or hooks with explicit inputs so it can be unit tested later.
- **Formatting is Prettier's job.** No semicolons, single quotes, 120 columns, Tailwind class sorting. Run `npm run format` rather than formatting by hand.
- **Ask when it matters.** If a request is ambiguous in a way that changes the result, ask before coding. Routine judgment calls are yours to make.

## Skills

Project-specific and vendored skills live in `.agents/skills/<name>/SKILL.md` (the cross-harness location). Read the relevant `SKILL.md` before working in that area; read its `references/` only when the task needs that detail.

| Skill                         | Use when                                                            |
| ----------------------------- | ------------------------------------------------------------------- |
| `warera-api`                  | Adding or changing data hooks, touching the SDK, upgrading the SDK. |
| `new-dashboard-page`          | Adding a page, route, nav entry, chart or card.                     |
| `react-dev`                   | React 19 + TypeScript typing patterns.                              |
| `typescript-react-reviewer`   | Reviewing React code for anti-patterns.                             |
| `tailwind-v4-shadcn`          | Theme, dark mode or shadcn setup issues.                            |
| `vercel-react-best-practices` | Performance-sensitive React changes.                                |
| `vite`                        | `vite.config.ts` or plugin changes.                                 |
| `vitest`                      | When a test runner is introduced.                                   |
| `chrome-devtools`             | Driving a real browser against the dev server.                      |
| `web-design-reviewer`         | Visual review of a running page.                                    |

Claude Code also discovers them through the `.claude/skills` symlink to `.agents/skills`.

## Git and pull requests

- Conventional Commits, lowercase imperative subjects (`feat: add region unrest chart`).
- Pin new dependencies to exact versions and commit `package-lock.json` with them.
- Keep PRs focused. Separate tooling, refactors and features.
- CI must be green before merge; Vercel deploys `main` automatically.
