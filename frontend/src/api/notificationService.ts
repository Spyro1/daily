import type { AlertColor } from '@mui/material'

type NotifyFn = (message: string, severity?: AlertColor) => void

let _handler: NotifyFn | null = null

/**
 * Module-level bridge between the axios interceptor (imperative) and
 * the React Snackbar provider. The provider calls `setHandler` on mount,
 * then every caller can use `notify` without caring about React context.
 */
export const notificationService = {
  setHandler(fn: NotifyFn) {
    _handler = fn
  },

  notify(message: string, severity: AlertColor = 'info') {
    if (_handler) {
      _handler(message, severity)
    } else {
      console.warn('[notify]', severity, message)
    }
  },
}
