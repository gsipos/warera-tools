# warera-tools

Dashboard & tools for [warera.io](https://warera.io) game.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Environment Variables

Create a `.env` file in the project root (or set these in your deployment environment):

| Variable                      | Required | Description                                                                                                                                 |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_WARERA_DEFAULT_API_KEY` | Yes      | API key for authenticating with the WarEra tRPC API (`api2.warera.io`). Passed via `X-API-Key` header.                                      |
| `VITE_QUERY_CACHE_BUSTER`     | Yes      | Integer value used to invalidate the IndexedDB persisted cache. Bump this when response shapes change to force a fresh fetch for all users. |

> **Note:** `VITE_`-prefixed variables are embedded in the client bundle at build time. Do not use secrets here — this is a public-facing SPA.

### Install & Run

```bash
npm install
npm run dev        # starts dev server on http://localhost:3001
```

## Architecture

The app fetches all game data from the WarEra tRPC API via [`@wareraprojects/api`](https://github.com/WarEraProjects/TRPC) — a fully-typed tRPC client with built-in batching, rate limiting, and retries.

React Query (TanStack Query v5) manages caching and UI state. An optional IndexedDB persistence layer is available for immutable historical data.

All API access goes through a single file: **`src/api/warera-api.ts`**.

📖 **[API Layer Documentation](./docs/api-layer.md)** — detailed guide for developers working with the data-fetching layer.

## Documentation

- [API Layer Architecture](./docs/api-layer.md) — how data fetching works, rules, patterns, and limitations
- [tRPC Migration Plan](./docs/trpc-migration-plan.md) — original migration strategy from custom fetch layer
- [tRPC Migration Testing](./docs/trpc-migration-testing.md) — manual testing checklist
