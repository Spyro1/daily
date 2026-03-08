import { useEffect, useState } from 'react'

import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { Alert, Box, CircularProgress, Paper, Stack, Typography } from '@mui/material'

import { oauthApi } from '@/api/clients'

export const Route = createFileRoute('/callback')({ component: CallbackPage })

function CallbackPage() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const completeLogin = async () => {
      try {
        await oauthApi.loginForAccessTokenApiV1OauthTokenPost()

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
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 460, p: 4, borderRadius: 8 }}>
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          <CircularProgress color="primary" />
          <Typography variant="h4">Finishing sign in</Typography>
          <Typography color="text.secondary">
            Daily is validating your session and redirecting you to the dashboard.
          </Typography>
          {errorMessage ? <Alert severity="error" sx={{ width: '100%' }}>{errorMessage}</Alert> : null}
        </Stack>
      </Paper>
    </Box>
  )
}