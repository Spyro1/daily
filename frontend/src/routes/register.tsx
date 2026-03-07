import type { FormEvent } from 'react'

import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
  Box,
} from '@mui/material'

import { AuthShell } from '@/components/AuthShell'

export const Route = createFileRoute('/register')({ component: RegisterPage })

function RegisterPage() {
  const onRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <AuthShell
      eyebrow="Create workspace access"
      title="Start with a clean account flow"
      description="Set up your account details now and connect full registration logic once the backend contract is finalized."
      footer={
        <Typography variant="body2" textAlign="center" color="text.secondary">
          Already have an account? <Link to="/">Go back to sign in</Link>
        </Typography>
      }
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.75}>
          <Typography variant="h4">Create account</Typography>
          <Typography color="text.secondary">
            This page is wired for production structure and ready for backend registration integration.
          </Typography>
        </Stack>

        <Box component="form" onSubmit={onRegister}>
          <Stack spacing={2}>
            <TextField
              id="name"
              name="name"
              label="Name"
              type="text"
              autoComplete="name"
              required
              fullWidth
            />

            <TextField
              id="email"
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              fullWidth
            />

            <TextField
              id="password"
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              fullWidth
            />

            <TextField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              fullWidth
            />

            <Button type="submit" variant="contained" size="large" fullWidth>
              Create account
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary">
          Registration submission is intentionally scaffolded until the final API endpoint is available.
        </Typography>
      </Stack>
    </AuthShell>
  )
}
