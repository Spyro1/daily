import type { PropsWithChildren, ReactNode } from 'react'

import { Box, Chip, Stack, Typography, useTheme } from '@mui/material'

import { APP_NAME } from '@/constants'
import { ThemeModeToggle } from '@/components/ThemeModeToggle'

type AuthShellProps = PropsWithChildren<{
  eyebrow: string
  title: string
  description: string
  footer?: ReactNode
}>

export function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: { xs: 'stretch', md: 'center' },
        px: { xs: 1.5, sm: 2.5 },
        py: { xs: 1.5, sm: 3 },
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1120,
          minHeight: { xs: 'calc(100dvh - 24px)', md: 680 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
          borderRadius: { xs: 4, md: 6 },
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 24px 80px rgba(15, 23, 42, 0.12)'
              : '0 28px 90px rgba(0, 0, 0, 0.45)',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            px: { xs: 2.5, sm: 4, md: 5 },
            py: { xs: 3, md: 5 },
            color: 'common.white',
            background: theme.palette.mode === 'light'
              ? 'linear-gradient(160deg, #0f3d91 0%, #1d4ed8 52%, #3b82f6 100%)'
              : 'linear-gradient(160deg, #08111f 0%, #10264a 48%, #1d4ed8 100%)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at top left, rgba(255,255,255,0.24), transparent 35%), radial-gradient(circle at bottom right, rgba(255,255,255,0.12), transparent 28%)',
              pointerEvents: 'none',
            }}
          />
          <Stack sx={{ position: 'relative', height: '100%' }} spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Chip
                label={APP_NAME}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.14)',
                  color: 'inherit',
                  fontWeight: 700,
                }}
              />
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <ThemeModeToggle />
              </Box>
            </Stack>

            <Stack spacing={2} sx={{ mt: { md: 'auto' }, maxWidth: 420 }}>
              <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: '0.18em' }}>
                {eyebrow}
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.2rem' }, lineHeight: 1.05 }}>
                {title}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.02rem' }}>
                {description}
              </Typography>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ color: 'rgba(255,255,255,0.8)' }}
            >
              <Chip label="TanStack Router" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'inherit' }} />
              <Chip label="React Query" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'inherit' }} />
              <Chip label="Material UI" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'inherit' }} />
            </Stack>
          </Stack>
        </Box>

        <Box
          sx={{
            px: { xs: 2.5, sm: 4, md: 5 },
            py: { xs: 3, md: 5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.paper',
          }}
        >
          <Stack spacing={3} width="100%" maxWidth={420}>
            <Box sx={{ alignSelf: 'flex-end', display: { xs: 'block', md: 'none' } }}>
              <ThemeModeToggle />
            </Box>
            {children}
            {footer}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}