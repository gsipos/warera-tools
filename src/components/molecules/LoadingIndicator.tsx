import { DownloadIcon } from 'lucide-react'
import { Progress } from '../ui/progress'
import { useLoadingState } from '@/hooks/use-loading-state'

export const LoadingIndicator = () => {
  const loadingState = useLoadingState()

  if (!loadingState.isLoading) {
    return <div />
  }

  return (
    <div className="flex flex-row items-center gap-1">
      <DownloadIcon />
      <Progress value={loadingState.progress} className="w-48" />
    </div>
  )
}
