import { useEffect, useState } from 'react'
import { subscribe } from './syncManager'

/**
 * React hook that returns the number of pending offline mutations
 * and whether a sync is currently in progress.
 */
export function usePendingSync(): { pending: number; syncing: boolean } {
  const [state, setState] = useState({ pending: 0, syncing: false })

  useEffect(() => {
    return subscribe((pending, syncing) => {
      setState({ pending, syncing })
    })
  }, [])

  return state
}
