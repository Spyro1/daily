import { useSyncExternalStore } from 'react'

function getSnapshot(): boolean {
  return navigator.onLine
}

function getServerSnapshot(): boolean {
  return true
}

function subscribeToOnlineStatus(callback: () => void): () => void {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

/**
 * React hook that returns the current online/offline status.
 * Re-renders automatically when connectivity changes.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeToOnlineStatus,
    getSnapshot,
    getServerSnapshot,
  )
}
