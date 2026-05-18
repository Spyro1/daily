import type { InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { apiClient } from './clients'
import { authOauthApi } from './authClient'
import { notificationService } from './notificationService'

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

function extractMessage(error: unknown): string {
  const e = error as { response?: { data?: { message?: string; detail?: unknown } } }
  const data = e.response?.data

  if (!data) return 'Network error — check your connection'

  if (typeof data.message === 'string' && data.message) return data.message

  // FastAPI 422 validation errors: detail is an array of objects with a 'msg' field
  if (Array.isArray(data.detail)) {
    const first = (data.detail as Array<{ msg?: string }>)[0]
    return first?.msg ? String(first.msg) : 'Validation failed'
  }

  if (typeof data.detail === 'string' && data.detail) return data.detail

  return ''
}

function labelFromStatus(status: number, extracted: string): string {
  if (extracted) return extracted
  switch (true) {
    case status === 400: return 'Bad request'
    case status === 401: return 'Unauthorized — please log in again'
    case status === 403: return 'Access denied — you are not allowed to perform this action'
    case status === 404: return 'Resource not found'
    case status === 409: return 'Conflict — the resource already exists'
    case status === 422: return 'Validation failed'
    case status >= 500: return 'Server error — please try again later'
    default:             return `Request failed (${status})`
  }
}

function severityFromStatus(status: number) {
  if (status === 422) return 'warning' as const
  return 'error' as const
}

let redirecting = false

/**
 * Attaches a response interceptor to the shared apiClient.
 * – 401: silently attempts a token refresh; retries the original request.
 *        If refresh also fails, calls `onUnauthenticated` and shows a toast.
 * – 403: shows "access denied" toast.
 * – 4xx / 5xx: extracts the server message and shows an error toast.
 *
 * Call this once, from the root component (after the SnackbarProvider mounts).
 */
export function initResponseHandler(onUnauthenticated: () => void) {
  redirecting = false

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: { config: RetryConfig; response?: { status: number }; code?: string; message?: string }) => {
      // Ignore intentionally canceled requests (route changes / query invalidations).
      if (axios.isAxiosError(error) && (error.code === 'ERR_CANCELED' || error.message === 'canceled')) {
        return Promise.reject(error)
      }

      const status = error.response?.status ?? 0
      const config = error.config

      // --- 401: attempt silent token refresh ---
      if (status === 401 && !config._retry) {
        config._retry = true
        try {
          // Use the interceptor-free authOauthApi to avoid an infinite loop
          await authOauthApi.refreshAccessTokenApiV1OauthRefreshPost()
          // Refresh succeeded — replay the original request transparently
          return await apiClient.request(config)
        } catch {
          // Refresh token also expired → redirect to login
          if (!redirecting) {
            redirecting = true
            notificationService.notify(
              'Your session has expired. Please sign in again.',
              'warning',
            )
            onUnauthenticated()
          }
          return Promise.reject(error)
        }
      }

      // Already redirecting — swallow further noise
      if (status === 401) return Promise.reject(error)

      // --- All other errors: show a toast ---
      const extracted = extractMessage(error)
      const label = labelFromStatus(status, extracted)
      notificationService.notify(label, severityFromStatus(status))

      return Promise.reject(error)
    },
  )
}
