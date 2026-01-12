import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'
import { PropsWithChildren } from 'react'
import { WarEra } from 'warera-api'

interface Props {
  level: WarEra.ArmorLevel
  className?: string
}

const backgroundVariants = cva('flex flex-col items-center justify-center rounded-md text-xs', {
  variants: {
    level: {
      1: 'bg-linerar-to-tr from-zinc-600/30 to-zinc-800/10 text-zinc-200',
      2: 'bg-linear-to-tr from-green-600/30 to-green-800/10 text-green-200',
      3: 'bg-linear-to-tr from-blue-600/30 to-blue-800/10 text-blue-200',
      4: 'bg-linear-to-tr from-purple-600/30 to-purple-800/10 text-purple-200',
      5: 'bg-linear-to-tr from-yellow-600/30 to-yellow-800/10 text-yellow-200',
      6: 'bg-linear-to-tr from-red-600/30 to-red-800/10 text-red-200',
    },
  },
})

export const ItemBackground = (props: PropsWithChildren<Props>) => {
  return (
    <div className={cn(backgroundVariants({ level: props.level, className: props.className }))}>{props.children}</div>
  )
}
