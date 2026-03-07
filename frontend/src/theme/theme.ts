import { alpha, createTheme } from '@mui/material/styles'

import type { Theme } from '@mui/material/styles'

import type { ThemeMode } from '@/theme/themeMode'

const buildTheme = (mode: ThemeMode): Theme => {
  const isLight = mode === 'light'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isLight ? '#2563eb' : '#60a5fa',
        light: isLight ? '#3b82f6' : '#93c5fd',
        dark: isLight ? '#1d4ed8' : '#2563eb',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isLight ? '#f59e0b' : '#fbbf24',
        contrastText: '#111827',
      },
      background: {
        default: isLight ? '#edf4ff' : '#08111f',
        paper: isLight ? '#ffffff' : '#0f1b31',
      },
      text: {
        primary: isLight ? '#0f172a' : '#f8fafc',
        secondary: isLight ? '#475569' : '#94a3b8',
      },
      divider: isLight ? alpha('#1e293b', 0.1) : alpha('#cbd5e1', 0.12),
    },
    shape: {
      borderRadius: 20,
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.04em',
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.03em',
      },
      button: {
        fontWeight: 700,
        textTransform: 'none',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            minHeight: '100vh',
            background: (
              isLight
                ? [
                    'radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 28%)',
                    'radial-gradient(circle at bottom right, rgba(245,158,11,0.16), transparent 26%)',
                    '#edf4ff',
                  ].join(',')
                : [
                    'radial-gradient(circle at top left, rgba(59,130,246,0.22), transparent 24%)',
                    'radial-gradient(circle at bottom right, rgba(14,165,233,0.18), transparent 20%)',
                    '#08111f',
                  ].join(',')
            ),
            backgroundAttachment: 'fixed',
          },
          '#app': {
            minHeight: '100vh',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 18,
            minHeight: 48,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  })
}

const lightTheme = buildTheme('light')
const darkTheme = buildTheme('dark')

export const getThemeByName = (name: ThemeMode) =>
  name === 'light' ? lightTheme : darkTheme

export const setThemeNext = (name: ThemeMode): ThemeMode =>
  name === 'light' ? 'dark' : 'light'