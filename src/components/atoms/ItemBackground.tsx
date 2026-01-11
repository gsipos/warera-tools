import { cva } from 'class-variance-authority'
import { PropsWithChildren } from 'react'
import { WarEra } from 'warera-api'

interface Props {
  level: WarEra.ArmorLevel
  className?: string
}

const backgroundVariants = cva('flex flex-col items-center justify-center p-1 rounded-md p-0 text-xs', {
  variants: {
    level: {
      1: 'bg-linerar-to-tr from-gray-600/60 to-gray-800/40 text-gray-200',
      2: 'bg-linear-to-tr from-green-600/60 to-green-800/40 text-green-200',
      3: 'bg-linear-to-tr from-blue-600/60 to-blue-800/40 text-blue-200',
      4: 'bg-linear-to-tr from-purple-600/60 to-purple-800/40 text-purple-200',
      5: 'bg-linear-to-tr from-yellow-600/60 to-yellow-800/40 text-yellow-200',
      6: 'bg-linear-to-tr from-red-600/60 to-red-800/40 text-red-200',
    },
  },
})

export const ItemBackground = (props: PropsWithChildren<Props>) => {
  return <div className={backgroundVariants({ level: props.level, className: props.className })}>{props.children}</div>
}
