---
description: 'Use class-variance-authority (cva) for component variant styling'
applyTo: '**/*.tsx'
---

# CVA & Component Variants

- Use `cva` from `class-variance-authority` to define variant styles for components
- Export the variants object alongside the component so it can be reused or composed
- Use `VariantProps<typeof myVariants>` to derive prop types from the variants definition
- Combine variant classes with additional classNames using the `cn()` utility

## Pattern

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const myVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'default-classes',
      secondary: 'secondary-classes',
    },
    size: {
      default: 'size-default',
      sm: 'size-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

interface Props extends VariantProps<typeof myVariants> {
  className?: string
}

export const MyComponent = ({ variant, size, className }: Props) => (
  <div className={cn(myVariants({ variant, size }), className)} />
)
```

## Guidelines

- Keep variant definitions close to the component that uses them (same file)
- Prefer Tailwind utility classes inside variants — avoid custom CSS
- Use `defaultVariants` so the component works without explicit variant props
- Do not create cva definitions for one-off styles — only use when a component has meaningful, reusable variants
