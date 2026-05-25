---
description: 'React component architecture and UI conventions using shadcn/ui'
applyTo: '**/*.tsx, **/*.ts'
---

# React & UI Guidelines

## Component Architecture

- Write small, focused components — avoid large monolithic components with too much logic
- Extract sub-components when a component grows beyond a single clear responsibility
- Keep component files short and readable; if a file is getting long, split it up

## UI & Styling

- Use stock shadcn/ui components and their default styling
- Avoid custom styles and custom UI components when shadcn provides a suitable alternative
- Keep the UI simple and consistent — do not over-customize appearance
- If a shadcn component doesn't quite fit, prefer composing existing primitives over building from scratch

## TypeScript

- Use TypeScript for all new code
- Define explicit types for component props
- Avoid `any` — use proper types or `unknown` when the type is genuinely not known
