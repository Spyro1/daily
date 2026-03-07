const runtimeEnv = (window as Window & {
  __ENV__?: {
    VITE_API_BASE_URL?: string
  }
}).__ENV__

export const APP_NAME = 'Daily'

export const API_BASE =
  runtimeEnv?.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  window.location.origin