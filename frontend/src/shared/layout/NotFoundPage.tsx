import { Link } from '@tanstack/react-router'
import { Box, Button, Stack, Typography } from '@mui/material'

export function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        px: 3,
      }}
    >
      <Stack spacing={2} alignItems="center" textAlign="center" maxWidth={420}>
        <Typography variant="h3">404 Page not found</Typography>
        <Typography color="text.secondary">
          The page you requested does not exist or was moved.
        </Typography>
        <Button component={Link} to="/" variant="contained">
          Back to sign in
        </Button>
      </Stack>
    </Box>
  )
}