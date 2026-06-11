/// <reference types="vite/client" />
interface Window {
  ksu?: object
}

interface ImportMetaEnv {
  readonly VITE_BACKEND_API_BASE?: string
  readonly VITE_BACKEND_HOST?: string
  readonly VITE_BACKEND_PASSWORD?: string
  readonly VITE_BACKEND_PORT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
