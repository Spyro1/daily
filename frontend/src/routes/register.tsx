import { useState } from 'react'
import type { FormEvent } from 'react'

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Button,
  Divider,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
  Box,
  Paper,
} from '@mui/material'
import { useLocalAuth } from '#/features/auth/hooks/useLocalAuth'

export const Route = createFileRoute('/register')({ component: RegisterPage })

function RegisterPage() {
  const navigate = useNavigate()
  const { loginLocal } = useLocalAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedName) {
      setError('Name is required.')
      return
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('A valid email is required.')
      return
    }

    try {
      await loginLocal(trimmedName, trimmedEmail)
      void navigate({ to: '/dashboard', replace: true })
    } catch {
      setError('Failed to create local profile. Please try again.')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 520, p: { xs: 3, md: 4 }, borderRadius: 2 }}>
        <Stack spacing={2.5}>
          <Stack spacing={0.75}>
            <Typography variant="h4">Get started locally</Typography>
            <Typography color="text.secondary">
              Your data will be stored on this device. You can link a Google account later to sync across devices.
            </Typography>
          </Stack>

          <Box component="form" onSubmit={onRegister}>
            <Stack spacing={2}>
              <TextField
                id="name"
                name="name"
                label="Display name"
                type="text"
                autoComplete="name"
                required
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <TextField
                id="email"
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="Used as your identifier — not sent to any server in local mode."
              />

              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}

              <Button type="submit" variant="contained" size="large" fullWidth>
                Start using Daily
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <MuiLink
              component="a"
              href="/"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                void navigate({ to: '/' })
              }}
              underline="hover"
            >
              Go back to sign in
            </MuiLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}
