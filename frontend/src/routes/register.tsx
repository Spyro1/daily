import type { FormEvent } from 'react'

import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
  Box,
  Paper,
} from '@mui/material'

export const Route = createFileRoute('/register')({ component: RegisterPage })

function RegisterPage() {
  const onRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 520, p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Stack spacing={2.5}>
          <Stack spacing={0.75}>
            <Typography variant="h4">Create account</Typography>
            <Typography color="text.secondary">
              This page is scaffolded until local registration is wired to the backend.
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
            Already have an account? <Link to="/">Go back to sign in</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}
