import { useEffect } from 'react'
import { Outlet, createRootRoute, useNavigate } from '@tanstack/react-router'
import { Box, CssBaseline, ThemeProvider } from '@mui/material'

import { NotFoundPage } from '#/shared/layout/NotFoundPage'
import { getThemeByName } from '@/theme/theme'
import { ThemeModeProvider, useThemeMode } from '@/theme/themeMode'
import { HealthIcon } from '#/shared/ui/HealthIcon'
import { BottomNav } from '#/shared/layout/BottomNav'
import { SnackbarProvider } from '#/shared/providers/SnackbarProvider'
import { AuthGuard } from '#/features/auth/components/AuthGuard'
import { initResponseHandler } from '#/api/responseHandler'

const MOBILE_MAX_WIDTH = 480

function RootLayout() {
  const { mode } = useThemeMode()
  const navigate = useNavigate()

  // Set up axios interceptor once: handles 401 refresh + error toasts.
  // Must run inside SnackbarProvider so notificationService handler is already set.
  useEffect(() => {
    initResponseHandler(() => void navigate({ to: '/', replace: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ThemeProvider theme={getThemeByName(mode)}>
      <CssBaseline />

      <Box
        sx={{
          maxWidth: MOBILE_MAX_WIDTH,
          mx: 'auto',
          width: '100%',
          minHeight: '100dvh',
          position: 'relative',
        }}
      >
        {/* Development only */}
        <Box sx={{ position: 'absolute', top: 5, right: 5, zIndex: 1 }}>
          <HealthIcon />
        </Box>
        {/* Development only END */}

        <AuthGuard>
          <Outlet />
        </AuthGuard>
      </Box>

      {/* Global bottom navigation — hides itself on auth pages */}
      <BottomNav maxWidth={MOBILE_MAX_WIDTH} />
    </ThemeProvider>
  )
}

function RootComponent() {
  return (
    <ThemeModeProvider>
      <SnackbarProvider>
        <RootLayout />
      </SnackbarProvider>
    </ThemeModeProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})
