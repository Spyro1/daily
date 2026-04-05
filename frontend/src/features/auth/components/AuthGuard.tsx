import type { ReactNode } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useLocation } from '@tanstack/react-router'
import { useAuthVerification } from '../hooks/useAuthVerification'
import { useLocalAuth } from '../hooks/useLocalAuth'

/** Paths that are accessible without authentication. */
const PUBLIC_PATHS = ['/', '/callback', '/register']

interface AuthGuardProps {
  children: ReactNode
}

/**
 * Wraps every page rendered by the root route.
 * – Public paths (login, callback, register): rendered immediately, no check.
 * – Local mode (IndexedDB): user is "authenticated" locally, no server check.
 * – Online mode: verifies auth via /validate + /refresh before showing content.
 *   Shows a centered spinner while the check is in-flight.
 *   Redirects to "/" if both tokens are expired.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()
  const { mode } = useLocalAuth()
  const isPublic = PUBLIC_PATHS.includes(location.pathname)

  // Local mode is always "authenticated" — skip server verification
  const isLocal = mode === 'local'

  const { status } = useAuthVerification({ skip: isPublic || isLocal })

  if (isPublic) return <>{children}</>

  // Local user — no server check needed
  if (isLocal) return <>{children}</>

  // Still determining auth mode on first load
  if (mode === 'undetermined') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100dvh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (status === 'pending') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100dvh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // 'unauthenticated' → the hook has already started the redirect; render nothing
  if (status === 'unauthenticated') return null

  return <>{children}</>
}
