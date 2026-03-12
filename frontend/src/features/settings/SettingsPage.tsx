import {
  DarkModeRounded,
  InfoRounded,
  LightModeRounded,
} from '@mui/icons-material'
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material'
import { ThemeModeToggle } from '#/shared/ThemeModeToggle'
import { useThemeMode } from '@/theme/themeMode'
import { PageLayout } from '#/shared/layout/PageLayout'

export function SettingsPage() {
  const { mode } = useThemeMode()

  return (
    <PageLayout title="Settings">
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <List disablePadding>
          <ListItem secondaryAction={<ThemeModeToggle />} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              {mode === 'dark' ? <DarkModeRounded /> : <LightModeRounded />}
            </ListItemIcon>
            <ListItemText
              primary="Theme"
              secondary={mode === 'dark' ? 'Dark mode' : 'Light mode'}
            />
          </ListItem>

          <Divider />

          <ListItem sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <InfoRounded />
            </ListItemIcon>
            <ListItemText primary="Daily" secondary="Personal finance tracker" />
          </ListItem>
        </List>
      </Paper>

      <Box>
        <Typography variant="caption" color="text.secondary">
          More settings coming soon.
        </Typography>
      </Box>
    </PageLayout>

  )
}
