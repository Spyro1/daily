import type { FormEvent } from 'react'

import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  Alert,
  Box,
} from '@mui/material'

import { healthApi } from '@/api/clients'
import { queryKeys } from '@/api/queryKeys'
import { AuthShell } from '@/components/AuthShell'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { data: healthStatus } = useQuery({
    queryKey: queryKeys.health,
    queryFn: async () => {
      const response = await healthApi.healthHealthGet()
      return response.data
    },
    retry: 1,
  })

  const onLocalLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  const onGoogleLogin = () => {
    window.location.assign('/api/v1/google/login')
  }

  return (
    <AuthShell
      eyebrow="Daily workspace"
      title="Welcome back"
      description="Sign in to continue with your daily dashboard, quick actions, and synchronized workspace settings."
      footer={
        <Typography variant="body2" textAlign="center" color="text.secondary">
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one now</Link>
        </Typography>
      }
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.75}>
          <Typography variant="h4">Sign in</Typography>
          <Typography color="text.secondary">
            Use your account credentials or continue with Google.
          </Typography>
        </Stack>

        {healthStatus != null ? (
          <Alert severity="success">Backend connection is available.</Alert>
        ) : (
          <Alert severity="info">Backend status will appear here when reachable.</Alert>
        )}

        <Box component="form" onSubmit={onLocalLogin}>
          <Stack spacing={2}>
            <TextField
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              required
              fullWidth
            />

            <TextField
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="Enter password"
              autoComplete="current-password"
              required
              fullWidth
            />

            <FormControlLabel
              control={<Checkbox id="rememberMe" name="rememberMe" color="primary" />}
              label="Remember Me"
            />

            <Button type="submit" variant="contained" size="large" fullWidth>
              Sign in
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }}>Or</Divider>

        <Stack spacing={1.5}>
          <Button
            type="button"
            variant="outlined"
            size="large"
            fullWidth
            onClick={onGoogleLogin}
          >
            Continue with Google
          </Button>
        </Stack>
      </Stack>
    </AuthShell>
  )
}
