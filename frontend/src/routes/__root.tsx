import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Box, CssBaseline, ThemeProvider } from '@mui/material'

import { NotFoundPage } from '#/shared/layout/NotFoundPage'
import { getThemeByName } from '@/theme/theme'
import { ThemeModeProvider, useThemeMode } from '@/theme/themeMode'
import { HealthIcon } from '#/shared/ui/HealthIcon'
import { BottomNav } from '#/shared/layout/BottomNav'

const MOBILE_MAX_WIDTH = 480

function RootLayout() {
  const { mode } = useThemeMode()

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
        {/* <Box sx={{ position: 'absolute', top: 5, right: 5, zIndex: 1 }}>
          <ThemeModeToggle />
        </Box> */}
        {/* Development only END */}

        <Outlet />
      </Box>

      {/* Global bottom navigation — hides itself on auth pages */}
      <BottomNav maxWidth={MOBILE_MAX_WIDTH} />
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
