import type { ReactNode } from 'react'
import { Box, Stack } from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'

export interface PageLayoutProps {
  /** Coloured overline caption above the title */
  overline?: string
  /** Page title rendered as h3 */
  title?: string
  /** Element placed to the right of the title (e.g. an icon button) */
  action?: ReactNode
  /** Center content vertically/horizontally — for auth/landing pages */
  centered?: boolean
  children: ReactNode
}

export function PageLayout({
  overline,
  title,
  action,
  centered = false,
  children,
}: PageLayoutProps) {
  if (centered) {
    return (
      <Box
        sx={{
          minHeight: '100dvh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 1.5, sm: 3 },
          py: { xs: 1.5, sm: 2.5 },
        }}
      >
        {children}
      </Box>
    )
  }

  return (
    <Stack
      spacing={2.5}
      sx={{
        width: '100%',
        minHeight: '100dvh',
        px: { xs: 1.5, sm: 2.5 },
        pt: 1.5,
        pb: 12,
      }}
    >
      {(overline ?? title) ? (
        <PageHeader overline={overline} title={title ?? ''} action={action} />
      ) : null}
      {children}
    </Stack>
  )
}
