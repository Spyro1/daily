import type { ReactNode } from 'react'
import { Stack, Typography } from '@mui/material'

export interface PageHeaderProps {
  overline?: string
  title: string
  action?: ReactNode
}

export function PageHeader({ overline, title, action }: PageHeaderProps) {
  return (
    <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
      <Stack spacing={0}>
        {overline && (
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', letterSpacing: '0.18em', fontWeight: 800 }}
          >
            {overline}
          </Typography>
        )}
        <Typography variant="h3">{title}</Typography>
      </Stack>
      {action}
    </Stack>
  )
}
