import { Outlet, createRootRoute } from '@tanstack/react-router'
import { CssBaseline, ThemeProvider } from '@mui/material'

import { NotFoundPage } from '@/components/NotFoundPage'
import { getThemeByName } from '@/theme/theme'
import { ThemeModeProvider, useThemeMode } from '@/theme/themeMode'

function RootLayout() {
  const { mode } = useThemeMode()

  return (
    <ThemeProvider theme={getThemeByName(mode)}>
      <CssBaseline />
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
