import { useEffect, useState } from 'react'

import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { Alert, CircularProgress, Stack, Typography } from '@mui/material'

import { authOauthApi } from '#/api/authClient'
import { PageLayout } from '#/shared/layout/PageLayout'
import { ErrorRounded } from '@mui/icons-material'
import { useLocalAuth } from '#/features/auth/hooks/useLocalAuth'
import { hasLocalData, syncPushToBackend } from '@/lib/syncPush'

export const Route = createFileRoute('/callback')({ component: CallbackPage })

function CallbackPage() {
  const navigate = useNavigate()
  const { setOnline, clearLocalData } = useLocalAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusText, setStatusText] = useState('Signing in...')

  useEffect(() => {
    let cancelled = false

    const completeLogin = async () => {
      try {
        await authOauthApi.validateAccessTokenApiV1OauthValidatePost()
        if (cancelled) return

        // Mark as online (Google-authenticated)
        setOnline()

        // If there is local data, push it to the backend
        const hasData = await hasLocalData()
        if (hasData) {
          if (!cancelled) setStatusText('Syncing local data...')
          try {
            await syncPushToBackend()
            // Clear local DB after successful sync
            await clearLocalData()
          } catch {
            // Sync failed — data stays in IndexedDB for a retry later
            console.warn('[callback] Sync push failed, local data preserved')
          }
        }

        if (!cancelled) {
          void navigate({ to: '/dashboard', replace: true })
        }
      } catch {
        if (!cancelled) {
          setErrorMessage('Login could not be completed. Please try again.')
        }
      }
    }

    void completeLogin()

    return () => {
      cancelled = true
    }
  }, [navigate, setOnline, clearLocalData])

  return (
    <PageLayout centered>
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          {errorMessage ? <ErrorRounded /> : <CircularProgress color="primary" />}
          <Typography variant="h4">{errorMessage ? 'Sign in failed' : statusText}</Typography>
          <Typography color="text.secondary">
            {errorMessage
              ? 'Something went wrong during authentication.'
              : 'Validating your session and redirecting to the dashboard…'}
          </Typography>
          {errorMessage ? <Alert severity="error" sx={{ width: '100%' }}>{errorMessage}</Alert> : null}
        </Stack>
    </PageLayout>
  )
}