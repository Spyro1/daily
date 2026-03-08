import { createFileRoute } from '@tanstack/react-router'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'

import { ThemeModeToggle } from '@/shared/ThemeModeToggle'

export const Route = createFileRoute('/dashboard')({ component: DashboardPage })

function DashboardPage() {
  return (
    <Box sx={{ minHeight: '100vh', px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.22em', fontWeight: 700 }}>
            Daily Dashboard
          </Typography>
          <Typography variant="h3">Home</Typography>
        </Box>
        <ThemeModeToggle />
      </Stack>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 8 }}>
        <Stack spacing={2}>
          <Chip label="Placeholder" sx={{ width: 'fit-content' }} color="primary" />
          <Typography variant="h4">Dashboard content will land here next.</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 640 }}>
            OAuth login is now routed into this page. You can use this view as the starting
            point for account balances, transaction summaries, and quick actions.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}