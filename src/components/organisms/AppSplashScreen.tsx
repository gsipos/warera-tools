import { useIsRestoring } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'
import { Spinner } from '../ui/spinner'

export const AppSplashScreen = (props: PropsWithChildren<unknown>) => {
  const isRestoring = useIsRestoring()

  if (isRestoring) {
    return (
      <div className="bg-background flex h-screen w-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return <>{props.children}</>
}
