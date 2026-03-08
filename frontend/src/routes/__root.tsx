import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Box, CssBaseline, ThemeProvider } from '@mui/material'

import { NotFoundPage } from '#/shared/layout/NotFoundPage'
import { getThemeByName } from '@/theme/theme'
import { ThemeModeProvider, useThemeMode } from '@/theme/themeMode'
import { ThemeModeToggle } from '#/shared/ThemeModeToggle'
import { HealthIcon } from '#/shared/ui/HealthIcon'

function RootLayout() {
  const { mode } = useThemeMode()

  return (
    <ThemeProvider theme={getThemeByName(mode)}>
      {/* Development only */}
      <CssBaseline />
      <Box sx={{ position: 'fixed', top: 5, left: 5, zIndex: 1 }}>
        <HealthIcon />
      </Box>

      <Box sx={{ position: 'fixed', top: 5, right: 5 }}>
        <ThemeModeToggle />
      </Box>

      <Outlet />
    </ThemeProvider>
  )
}

function RootComponent() {
  return (
    <ThemeModeProvider>
      <RootLayout />
    </ThemeModeProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})
