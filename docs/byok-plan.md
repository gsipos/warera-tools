# BYOK (Bring Your Own Key) Feature Plan

## Overview

Allow users to provide their own WarEra API key instead of relying on the app's shared default key. Users can obtain their personal key from the game's Profile menu → Settings tab.

---

## Step 1: API Key Store (Zustand + localStorage)

**New file:** `src/stores/api-key-store.ts`

Create a Zustand store with localStorage persistence that:
- Holds the user-provided API key (or `null` if not set)
- Exposes `effectiveKey`: returns user key or falls back to `VITE_WARERA_DEFAULT_API_KEY`
- Exposes `isCustomKey: boolean` for UI indicators
- Actions: `setApiKey(key: string)`, `clearApiKey()`

---

## Step 2: Reactive API Client

**Modified files:** `src/api/client.ts`, `src/api/warera-api.ts`

Make the API layer use the effective key from the store:
- If `createAPIClient` supports runtime key updates, subscribe to the store and call it on change
- Otherwise, implement a `getApiClient()` factory that recreates the client when the key changes
- For `rawTrpcFetch`, read the effective key from `useApiKeyStore.getState()` at call time

---

## Step 3: Cache Invalidation on Key Change

**Modified/new files:** `src/stores/api-key-store.ts`, `src/hooks/use-api-key-effect.ts`

When the API key changes:
1. Invalidate all React Query caches (in-memory and persisted/IndexedDB)
2. Call `useRefreshStore.refresh()` to bump the epoch
3. Show a toast confirming the switch

---

## Step 4: API Key Settings UI

**New file:** `src/components/molecules/ApiKeySettings.tsx`

A settings form that:
- Shows whether a custom key is active or the shared default is in use
- Input field for pasting a new API key (masked after save)
- "Save" button → validates key with a lightweight API call, then stores it
- "Reset to default" button → clears custom key
- Success/error feedback via sonner toasts

---

## Step 5: Header Nudge / Motivation Banner

**Modified file:** `src/pages/__root.tsx` or header/navigation component

When no custom key is set (`isCustomKey === false`), display a visible indicator in the app header to nudge users toward setting their own key. Options (pick one or combine):

- **Banner/badge approach:** A small persistent badge or pill in the header (e.g., "Using shared key — Set your own for better performance") that links to the settings dialog.
- **Tooltip/popover:** An info icon with a popover explaining the benefits of using a personal key (dedicated rate limits, no shared throttling).
- **First-visit callout:** A dismissible callout/alert that appears on first load, explaining BYOK and linking to settings. Once dismissed, falls back to the subtle badge.
- **Icon indicator:** A key icon in the header that is greyed-out/warning-colored when using the default key, and turns green/solid when a personal key is active.

**UX goals:**
- Make it clear but not annoying — users should understand they're on a shared key without feeling blocked
- Emphasize benefits: personal rate limits, faster responses, no contention with other users
- Provide a one-click path to the settings dialog from the nudge

---

## Step 6: Integration — Settings Access Point

**Modified files:** `src/pages/__root.tsx` or layout/navigation component

Add an entry point to open the API Key Settings (e.g., gear icon, user menu item, or triggered from the header nudge). This opens the `ApiKeySettings` component in a dialog/sheet.

---

## Sequencing & Parallelization

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| 1 | Step 1 (store) | None |
| 2 | Step 2 (client) + Step 4 (UI) | Step 1 |
| 3 | Step 3 (cache invalidation) | Steps 1 & 2 |
| 4 | Step 5 (header nudge) + Step 6 (integration) | Steps 1 & 4 |

---

## Design Considerations

- **Security:** Key stored in localStorage (client-side only). Mask in UI after save. Never log or transmit to third parties.
- **Migration:** Existing users seamlessly continue on the default key — no action required.
- **Error handling:** If a custom key returns 401/403, surface an error and offer to reset to default.
- **Benefits messaging:** "Using your own key gives you dedicated rate limits and faster responses."
