import type { ReactNode } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useLocation } from '@tanstack/react-router'
import { useAuthVerification } from '../hooks/useAuthVerification'

/** Paths that are accessible without authentication. */
const PUBLIC_PATHS = ['/', '/callback', '/register']

interface AuthGuardProps {
  children: ReactNode
}

/**
 * Wraps every page rendered by the root route.
 * – Public paths (login, callback, register): rendered immediately, no check.
 * – Protected paths: verifies auth via /validate + /refresh before showing content.
 *   Shows a centered spinner while the check is in-flight.
 *   Redirects to "/" if both tokens are expired.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()
  const isPublic = PUBLIC_PATHS.includes(location.pathname)

  const { status } = useAuthVerification({ skip: isPublic })

  if (isPublic) return <>{children}</>

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
