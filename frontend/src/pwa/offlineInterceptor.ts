/**
 * Axios response interceptor that catches network errors on mutation
 * requests (POST, PATCH, PUT, DELETE) and queues them in IndexedDB
 * for later replay.
 *
 * Must be initialised BEFORE initResponseHandler() so this interceptor
 * runs first in the Axios interceptor chain.
 */

import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { apiClient } from '@/api/clients'
import { notificationService } from '@/api/notificationService'
import { enqueue } from './offlineQueue'
import { REPLAY_HEADER } from './syncManager'

const MUTATION_METHODS = new Set(['post', 'patch', 'put', 'delete'])

export function initOfflineInterceptor(): void {
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig | undefined

      // Only handle network errors (no response received from server)
      if (error.response || !config) {
        return Promise.reject(error)
      }

      // Only queue mutation requests, not GETs
      const method = config.method?.toLowerCase() ?? ''
      if (!MUTATION_METHODS.has(method)) {
        return Promise.reject(error)
      }

      // Don't re-queue replay requests from the sync manager
      if (config.headers?.[REPLAY_HEADER]) {
        return Promise.reject(error)
      }

      // Queue the mutation for later sync
      try {
        let data: unknown = config.data
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data) as unknown
          } catch {
            /* keep as string */
          }
        }

        await enqueue({
          method: method.toUpperCase(),
          url: config.url ?? '',
          data,
        })

        notificationService.notify(
          'Saved offline — will sync when connected',
          'info',
        )

        // Return a mock success response so the mutation hook's onSuccess fires
        return {
          data: data ?? {},
          status: 200,
          statusText: 'Queued Offline',
          headers: {},
          config,
        }
      } catch (queueError) {
        console.error('Failed to queue offline mutation:', queueError)
        return Promise.reject(error)
      }
    },
  )
}
