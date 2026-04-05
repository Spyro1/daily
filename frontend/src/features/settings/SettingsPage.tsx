import { useState } from 'react'
import {
  CloudSyncRounded,
  DarkModeRounded,
  InfoRounded,
  LightModeRounded,
  LogoutRounded,
  PersonRounded,
  StorageRounded,
} from '@mui/icons-material'
import GoogleIcon from '@mui/icons-material/Google'
import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { ThemeModeToggle } from '#/shared/ThemeModeToggle'
import { useThemeMode } from '@/theme/themeMode'
import { PageLayout } from '#/shared/layout/PageLayout'
import { useLocalAuth } from '#/features/auth/hooks/useLocalAuth'
import { useNotify } from '#/shared/providers/SnackbarProvider'
import { API_BASE } from '@/constants'
import { authOauthApi } from '#/api/authClient'
import { hasLocalData, syncPushToBackend } from '@/lib/syncPush'

export function SettingsPage() {
  const { mode: themeMode } = useThemeMode()
  const { mode: authMode, localUser, logoutLocal, clearLocalData } = useLocalAuth()
  const navigate = useNavigate()
  const notify = useNotify()
  const [syncing, setSyncing] = useState(false)

  const isLocal = authMode === 'local'

  const handleLinkGoogle = () => {
    // Redirect to Google OAuth — on return the callback will push local data
    location.assign(`${API_BASE}/api/v1/google/login`)
  }

  const handleLogout = async () => {
    if (isLocal) {
      await logoutLocal()
      void navigate({ to: '/', replace: true })
    } else {
      try {
        await authOauthApi.logoutApiV1OauthLogoutPost()
      } catch { /* ignore */ }
      void navigate({ to: '/', replace: true })
    }
  }

  const handleManualSync = async () => {
    if (isLocal) {
      notify('Link a Google account first to sync data.', 'info')
      return
    }
    setSyncing(true)
    try {
      const hasData = await hasLocalData()
      if (!hasData) {
        notify('No local data to sync.', 'info')
        return
      }
      const result = await syncPushToBackend()
      await clearLocalData()
      notify(
        `Synced: ${result.accounts_created} accounts, ${result.categories_created} categories, ${result.transactions_created} transactions`,
        'success',
      )
    } catch {
      notify('Sync failed. Please try again.', 'error')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <PageLayout title="Settings">
      {/* Account info */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <List disablePadding>
          <ListItem sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PersonRounded />
            </ListItemIcon>
            <ListItemText
              primary={isLocal ? localUser?.display_name ?? 'Local User' : 'Google Account'}
              secondary={isLocal ? localUser?.email : 'Authenticated via Google'}
            />
            <Chip
              label={isLocal ? 'Local' : 'Online'}
              color={isLocal ? 'warning' : 'success'}
              size="small"
              variant="outlined"
            />
          </ListItem>

          {isLocal && (
            <>
              <Divider />
              <ListItem sx={{ py: 1.5 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <StorageRounded />
                </ListItemIcon>
                <ListItemText
                  primary="Data stored locally"
                  secondary="Your data is only on this device. Link a Google account to backup and sync."
                />
              </ListItem>
            </>
          )}
        </List>
      </Paper>

      {/* Sync & Link */}
      {isLocal && (
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <List disablePadding>
            <ListItem
              secondaryAction={
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<GoogleIcon />}
                  onClick={handleLinkGoogle}
                >
                  Link Google
                </Button>
              }
              sx={{ py: 1.5, pr: 18 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <CloudSyncRounded />
              </ListItemIcon>
              <ListItemText
                primary="Sync to cloud"
                secondary="Sign in with Google to back up your data."
              />
            </ListItem>
          </List>
        </Paper>
      )}

      {/* Manual sync (for online users with leftover local data) */}
      {!isLocal && (
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <List disablePadding>
            <ListItem
              secondaryAction={
                <Button
                  variant="outlined"
                  size="small"
                  disabled={syncing}
                  onClick={handleManualSync}
                >
                  {syncing ? 'Syncing…' : 'Sync now'}
                </Button>
              }
              sx={{ py: 1.5, pr: 16 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <CloudSyncRounded />
              </ListItemIcon>
              <ListItemText
                primary="Push remaining local data"
                secondary="Upload any leftover local data from this device."
              />
            </ListItem>
          </List>
        </Paper>
      )}

      {/* Theme */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <List disablePadding>
          <ListItem secondaryAction={<ThemeModeToggle />} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              {themeMode === 'dark' ? <DarkModeRounded /> : <LightModeRounded />}
            </ListItemIcon>
            <ListItemText
              primary="Theme"
              secondary={themeMode === 'dark' ? 'Dark mode' : 'Light mode'}
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

      {/* Logout */}
      <Box sx={{ pt: 1 }}>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<LogoutRounded />}
          onClick={handleLogout}
        >
          {isLocal ? 'Sign out (local)' : 'Sign out'}
        </Button>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary">
          {isLocal
            ? 'Local mode — data is stored on this device only.'
            : 'Connected to Daily cloud via Google.'}
        </Typography>
      </Box>
    </PageLayout>
  )
}
