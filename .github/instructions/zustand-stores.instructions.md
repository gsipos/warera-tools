---
description: 'Zustand store conventions — separate state from actions, keep stores small and focused'
applyTo: '**/*.ts, **/*.tsx'
---

# Zustand Stores

- Define separate interfaces for state and actions, then combine them into a store type
- Keep stores small and focused on a single concern
- Place store files in `src/stores/` with kebab-case naming (e.g., `date-range-store.ts`)
- Export the hook directly from the store file (e.g., `export const useMyStore = create<MyStore>(...)`)
- Define an `initialState` object for easy resetting
- Include a `reset` action that restores `initialState`

## Store Structure

```typescript
import { create } from 'zustand'

interface MyState {
  count: number
}

interface MyActions {
  increment: () => void
  reset: () => void
}

type MyStore = MyState & MyActions

const initialState: MyState = {
  count: 0,
}

export const useMyStore = create<MyStore>((set) => ({
  ...initialState,
  increment: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set({ ...initialState }),
}))
```

## Guidelines

- Avoid putting derived/computed values in state — compute them in components or selectors
- Use `get()` inside actions only when you need current state to calculate the next state
- Do not add middleware (persist, devtools, immer) unless there is a clear, immediate need
