import { useEffect, useState } from 'react'

import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { Alert, CircularProgress, Stack, Typography } from '@mui/material'

import { oauthApi } from '@/api/clients'
import { PageLayout } from '#/shared/layout/PageLayout'
import { ErrorRounded } from '@mui/icons-material'

export const Route = createFileRoute('/callback')({ component: CallbackPage })

function CallbackPage() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const completeLogin = async () => {
      try {
        await oauthApi.validateAccessTokenApiV1OauthValidatePost()

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
  }, [navigate])

  return (
    <PageLayout centered>
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          {errorMessage ? <ErrorRounded /> : <CircularProgress color="primary" />}
          <Typography variant="h4">Signing in...</Typography>
          <Typography color="text.secondary">
            Daily is validating your session and redirecting you to the dashboard.
          </Typography>
          {errorMessage ? <Alert severity="error" sx={{ width: '100%' }}>{errorMessage}</Alert> : null}
        </Stack>
    </PageLayout>
  )
}