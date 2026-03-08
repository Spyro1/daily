import { createFileRoute } from '@tanstack/react-router'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'
import { PageLayout } from '#/shared/layout/PageLayout'

export const Route = createFileRoute('/dashboard')({ component: DashboardPage })

function DashboardPage() {
  return (
    <PageLayout verticalAlign="flex-start">
      <Box sx={{}}>
        <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.22em', fontWeight: 700 }}>
          Daily Dashboard
        </Typography>
      </Box>
    </PageLayout>
  )
}