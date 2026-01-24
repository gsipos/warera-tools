import { useLoadingState } from '@/hooks/use-loading-state'
import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'
import { CloudRainWindIcon, CloudSunIcon, SunIcon } from 'lucide-react'
import { useDeferredValue } from 'react'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../ui/item'
import { Progress } from '../ui/progress'

const itemVariants = cva('p-0', {
  variants: {
    state: {
      normal: '',
      delayed: 'text-yellow-500',
      retried: 'text-blue-500',
    },
  },
})

export const NetworkHealth = () => {
  const loadingState = useLoadingState()

  const isLoading = useDeferredValue(loadingState.isLoading)
  const progress = useDeferredValue(loadingState.progress)

  const delayed = loadingState.delayed
  const retried = loadingState.retried

  const state = delayed ? 'delayed' : ('normal' as const)
  return (
    <Item variant="default" size="sm" className={cn(itemVariants({ state }))}>
      <ItemMedia variant="default">
        {retried ? <CloudRainWindIcon /> : delayed ? <CloudSunIcon /> : <SunIcon />}
      </ItemMedia>
      <ItemContent>
        <ItemTitle className={cn(itemVariants({ state }))}>API</ItemTitle>
        <ItemDescription>
          {isLoading ? <Progress value={progress} className="h-1 w-10" /> : <div className="h-1 w-10" />}
        </ItemDescription>
      </ItemContent>
      <ItemContent></ItemContent>
    </Item>
  )
}
