import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { alpha } from '@mui/material/styles'
import GoogleIcon from '@mui/icons-material/Google'
import PersonOutlineRounded from '@mui/icons-material/PersonOutlineRounded'
import { Box, Button, Divider, Stack, Typography } from '@mui/material'
import { API_BASE } from '@/constants'
import { PageLayout } from '@/shared/layout/PageLayout'
import { useLocalAuth } from '#/features/auth/hooks/useLocalAuth'

export const Route = createFileRoute('/')({ component: App })

const logoSrc = '/brand/happy-wallet-logo-nobg.png'

function App() {
  const navigate = useNavigate()
  const { mode } = useLocalAuth()

  // If the user already has a local session, redirect to dashboard
  useEffect(() => {
    if (mode === 'local') {
      void navigate({ to: '/dashboard', replace: true })
    }
  }, [mode, navigate])

  const onGoogleLogin = () => {
    location.assign(`${API_BASE}/api/v1/google/login`)
  }

  const onLocalLogin = () => {
    void navigate({ to: '/register' })
  }

  return (
    <PageLayout centered>
      <Stack
        spacing={3}
        alignItems="center"
        sx={{
          width: '100%',
          maxWidth: 520,
          px: { xs: 3, sm: 5 },
          py: { xs: 4, sm: 5 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Stack spacing={2} alignItems="center" sx={{ position: 'relative' }}>
          <Box
            component="img"
            src={logoSrc}
            alt="Daily logo"
            sx={{
              width: { xs: 120, sm: 148 },
              height: { xs: 120, sm: 148 },
              objectFit: 'contain',
              filter: `drop-shadow(0 10px 32px ${alpha('#c9841b', 0.28)})`,
            }}
          />
          <Stack spacing={1}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', sm: '4rem' },
                lineHeight: 0.95,
                color: 'gold',
              }}
            >
              Daily
            </Typography>
            <Typography variant="h4">Welcome back</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 360 }}>
              Sign in with Google or continue locally.
            </Typography>
          </Stack>
        </Stack>

        <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 320 }}>
          <Button
            variant="contained"
            size="large"
            onClick={onGoogleLogin}
            startIcon={<GoogleIcon />}
            sx={{
              py: 1.6,
              px: 3,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Login via Google
          </Button>

          <Divider sx={{ my: 0.5 }}>
            <Typography variant="caption" color="text.secondary">or</Typography>
          </Divider>

          <Button
            variant="outlined"
            size="large"
            onClick={onLocalLogin}
            startIcon={<PersonOutlineRounded />}
            sx={{ py: 1.4, px: 3 }}
          >
            Continue with local account
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 320 }}>
          Local mode stores data on this device only. You can link a Google account later to sync.
        </Typography>
      </Stack>
    </PageLayout>
  )
}
