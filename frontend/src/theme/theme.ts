import { alpha, createTheme } from '@mui/material/styles'

import type { Theme } from '@mui/material/styles'

import type { ThemeMode } from '@/theme/themeMode'

const buildTheme = (mode: ThemeMode): Theme => {
  const isLight = mode === 'light'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isLight ? '#14633d' : '#7ddf93',
        light: isLight ? '#2c8f5c' : '#b7f2bf',
        dark: isLight ? '#0d4c2f' : '#52b36b',
        contrastText: isLight ? '#f7f3e8' : '#0e1110',
      },
      secondary: {
        main: isLight ? '#c9841b' : '#f2b84e',
        contrastText: '#1e1405',
      },
      background: {
        default: isLight ? '#f6f3ec' : '#101718',
        paper: isLight ? '#fffcf4' : '#172020',
      },
      text: {
        primary: isLight ? '#1f251d' : '#f6f1df',
        secondary: isLight ? '#5c6657' : '#b0b8a1',
      },
      divider: isLight ? alpha('#3d4f36', 0.12) : alpha('#f0e5bb', 0.12),
    },
    shape: {
      borderRadius: 20,
    },
    typography: {
      fontFamily: 'Manrope, sans-serif',
      h1: {
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 700,
        fontSize: '3.5rem',
        letterSpacing: '-0.05em',
      },
      h2: {
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 700,
        fontSize: '2.5rem',
        letterSpacing: '-0.04em',
      },
      h3: {
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 700,
        fontSize: '1.875rem',
        letterSpacing: '-0.04em',
      },
      h4: {
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 700,
        fontSize: '1.5rem',
        letterSpacing: '-0.03em',
      },
      h5: {
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 700,
        fontSize: '1.25rem',
        letterSpacing: '-0.02em',
      },
      h6: {
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 700,
        fontSize: '1.125rem',
        letterSpacing: '-0.02em',
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
            minHeight: '100dvh',
            background: (
              isLight
                ? [
                    'radial-gradient(circle at top left, rgba(20,99,61,0.18), transparent 28%)',
                    'radial-gradient(circle at bottom right, rgba(201,132,27,0.16), transparent 26%)',
                    '#f6f3ec',
                  ].join(',')
                : [
                    'radial-gradient(circle at top left, rgba(125,223,147,0.18), transparent 24%)',
                    'radial-gradient(circle at bottom right, rgba(242,184,78,0.16), transparent 20%)',
                    '#101718',
                  ].join(',')
            ),
            backgroundAttachment: 'fixed',
          },
          '#app': {
            minHeight: '100dvh',
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
            border: `1px solid ${isLight ? alpha('#406241', 0.08) : alpha('#f0e5bb', 0.08)}`,
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