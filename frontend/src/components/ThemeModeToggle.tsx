import DarkModeRounded from '@mui/icons-material/DarkModeRounded'
import LightModeRounded from '@mui/icons-material/LightModeRounded'
import { IconButton, Tooltip } from '@mui/material'

import { useThemeMode } from '@/theme/themeMode'

export function ThemeModeToggle() {
  const { mode, toggleTheme } = useThemeMode()
  const nextLabel = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <Tooltip title={nextLabel}>
      <IconButton aria-label={nextLabel} color="inherit" onClick={toggleTheme}>
        {mode === 'dark' ? <LightModeRounded /> : <DarkModeRounded />}
      </IconButton>
    </Tooltip>
  )
}