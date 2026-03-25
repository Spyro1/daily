/**
 * Manages replaying queued offline mutations when connectivity is restored.
 * Provides a pub/sub system so UI components can react to sync status changes.
 */

import axios from 'axios'
import { apiClient } from '@/api/clients'
import { queryClient } from '@/api/queryClient'
import { notificationService } from '@/api/notificationService'
import { getAll, dequeue, count } from './offlineQueue'

/** Header added to replayed requests so the offline interceptor skips them. */
export const REPLAY_HEADER = 'X-Offline-Replay'

type SyncListener = (pending: number, syncing: boolean) => void

const listeners = new Set<SyncListener>()
let isSyncing = false

function broadcast() {
  void count().then((n) => {
    for (const fn of listeners) fn(n, isSyncing)
  })
}

/** Subscribe to sync status changes; returns an unsubscribe function. */
export function subscribe(fn: SyncListener): () => void {
  listeners.add(fn)
  broadcast()
  return () => {
    listeners.delete(fn)
  }
}

/**
 * Replays all queued mutations in FIFO order.
 * - Network errors stop processing (device is still offline).
 * - Server errors (4xx/5xx) discard the mutation and continue.
 */
export async function processQueue(): Promise<void> {
  if (isSyncing) return

  const mutations = await getAll()
  if (mutations.length === 0) return

  isSyncing = true
  broadcast()

  let synced = 0

  for (const mutation of mutations) {
    try {
      await apiClient.request({
        method: mutation.method.toLowerCase(),
        url: mutation.url,
        data: mutation.data,
        headers: { [REPLAY_HEADER]: '1' },
      })
      await dequeue(mutation.id)
      synced++
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && !error.response) {
        // Network error → still offline, stop processing
        break
      }
      // Server error → discard this mutation (error toast shown by responseHandler)
      await dequeue(mutation.id)
    }
  }

  isSyncing = false

  if (synced > 0) {
    // Refresh all cached data to reflect synced changes
    void queryClient.invalidateQueries()
    notificationService.notify(
      `Synced ${synced} offline change${synced > 1 ? 's' : ''}`,
      'success',
    )
  }

  broadcast()
}

/**
 * Call once at app startup.
 * Listens for the browser `online` event and processes the queue.
 * Returns a cleanup function.
 */
export function initSyncManager(): () => void {
  const onOnline = () => void processQueue()

  window.addEventListener('online', onOnline)

  // Process any mutations left from a previous session
  if (navigator.onLine) {
    void processQueue()
  }

  return () => {
    window.removeEventListener('online', onOnline)
  }
}
