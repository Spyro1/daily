import { createFileRoute } from '@tanstack/react-router'
import { alpha } from '@mui/material/styles'
import GoogleIcon from '@mui/icons-material/Google'
import { Box, Button, Stack, Typography } from '@mui/material'
import { API_BASE } from '@/constants'
import { PageLayout } from '@/shared/layout/PageLayout'

export const Route = createFileRoute('/')({ component: App })

const logoSrc = '/brand/happy-wallet-logo-nobg.png'

function App() {
  const onGoogleLogin = () => {
    location.assign(`${API_BASE}/api/v1/google/login`)
  }

  return (
    <PageLayout>

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
              Sign in with Google to continue to your Daily dashboard.
            </Typography>
          </Stack>
        </Stack>

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

        <Typography variant="body2" color="text.secondary" sx={{ position: 'relative' }}>
          Secure OAuth login. You will be redirected back here after authentication.
        </Typography>
      </Stack>
    </PageLayout>
  )
}
