import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { authOauthApi } from '#/api/authClient'
import { useLocalAuth } from './useLocalAuth'

export type AuthStatus = 'pending' | 'authenticated' | 'unauthenticated'

/** Minimum time (ms) between verify calls across all page navigations. */
const VERIFY_COOLDOWN_MS = 5 * 60 * 1000

let lastVerifiedAt = 0

/**
 * On mount (once per component lifetime), verifies the user is authenticated:
 *   1. OauthApi.validateAccessToken  →  POST /api/v1/oauth/validate
 *   2. If 401 → OauthApi.refreshAccessToken  →  POST /api/v1/oauth/refresh
 *   3. If refresh also 401 → redirect to "/"
 *
 * Skips the network call if the last successful verification is recent
 * (< VERIFY_COOLDOWN_MS), to avoid hammering the server on every navigation.
 *
 * Pass `skip: true` on public pages or local-mode pages so no network call is made.
 */
export function useAuthVerification({ skip = false }: { skip?: boolean } = {}) {
  const navigate = useNavigate()
  const { setOnline } = useLocalAuth()
  const [status, setStatus] = useState<AuthStatus>(skip ? 'authenticated' : 'pending')
  const ran = useRef(false)

  const verify = useCallback(async () => {
    // Reuse a recent successful check — avoids a network call on every navigation
    if (Date.now() - lastVerifiedAt < VERIFY_COOLDOWN_MS) {
      setOnline()
      setStatus('authenticated')
      return
    }

    try {
      // Step 1: validate the current access token
      await authOauthApi.validateAccessTokenApiV1OauthValidatePost()
      lastVerifiedAt = Date.now()
      setOnline()
      setStatus('authenticated')
    } catch (err: unknown) {
      const httpStatus = (err as { response?: { status?: number } }).response?.status

      if (httpStatus === 401) {
        try {
          // Step 2: access token expired — attempt a silent refresh
          await authOauthApi.refreshAccessTokenApiV1OauthRefreshPost()
          lastVerifiedAt = Date.now()
          setOnline()
          setStatus('authenticated')
        } catch {
          // Step 3: refresh token also expired → force re-login
          lastVerifiedAt = 0
          setStatus('unauthenticated')
          void navigate({ to: '/', replace: true })
        }
      } else {
        // Network error or unexpected status — redirect to be safe
        lastVerifiedAt = 0
        setStatus('unauthenticated')
        void navigate({ to: '/', replace: true })
      }
    }
  }, [navigate])

  useEffect(() => {
    if (skip || ran.current) return
    ran.current = true
    void verify()
  }, [skip, verify])

  return { status }
}
