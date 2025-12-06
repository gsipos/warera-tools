import { DownloadIcon } from 'lucide-react'
import { Progress } from '../ui/progress'
import { useLoadingState } from '@/hooks/use-loading-state'
import { useDeferredValue } from 'react'

export const LoadingIndicator = () => {
  const loadingState = useLoadingState()

  const isLoading = useDeferredValue(loadingState.isLoading)
  const progress = useDeferredValue(loadingState.progress)

  if (!isLoading) {
    return <div className="flex flex-row items-center gap-1" />
  }

  return (
    <div className="flex flex-row items-center gap-1">
      <DownloadIcon />
      <Progress value={progress} className="w-48" />
    </div>
  )
}
