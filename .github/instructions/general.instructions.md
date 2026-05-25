---
description: 'General project philosophy and contributor guidelines for the warera-tools hobby project'
applyTo: '**'
---

# General Project Guidelines

This is a hobby project. Prioritize simplicity, readability, and speed of development over enterprise-grade robustness.

## Philosophy

- Prefer smaller, simpler solutions over complex or overengineered ones
- Choose the straightforward approach — avoid abstractions until they are clearly needed
- TypeScript is the preferred language whenever possible
- If something is unclear or not covered by existing instructions, stop and ask a question before jumping into coding

## Code Quality

- Code that contains meaningful logic must be written in a way that is easy to test
- Keep functions focused and side-effect-free where practical so they can be unit tested in isolation
- Avoid deep coupling between modules — prefer explicit dependencies over hidden ones

## Decision Making

- When choosing between two approaches, pick the one with less code and fewer moving parts
- Do not introduce new libraries or patterns without a clear, immediate need
- Do not add layers of indirection (factories, registries, service locators) unless justified by actual complexity
