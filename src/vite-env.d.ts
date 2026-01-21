/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_QUERY_CACHE_BUSTER: string
  readonly VITE_WARERA_DEFAULT_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.svg?react' {
  import type { SVGAttributes, DefineComponent } from 'react'

  const content: DefineComponent<SVGAttributes>
  export default content
}
