import { Box, Fab, Paper } from '@mui/material'
import { 
  HomeRounded,
  AccountBalanceRounded,
  AddRounded,
  CategoryRounded,
  SettingsRounded,
 } from '@mui/icons-material'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { NavButton } from '../ui/NavButton'

// Auth / public pages that should not show the bottom nav
const HIDE_ON_PATHS = ['/', '/callback', '/register']

export function getNavValue(path: string): number {
  if (path.startsWith('/dashboard')) return 0
  if (path.startsWith('/accounts')) return 1
  if (path.startsWith('/transactions/new')) return 2
  if (path.startsWith('/categories')) return 3
  if (path.startsWith('/settings')) return 4
  return -1
}

interface BottomNavProps {
  maxWidth?: number
}

export function BottomNav({ maxWidth = 480 }: BottomNavProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  if (HIDE_ON_PATHS.includes(path)) return null

  const value = getNavValue(path)

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
    <Paper
      elevation={8}
      sx={{
        width: '100%',
        maxWidth,
        borderRadius: 3,
        overflow: 'visible',
        bgcolor: 'background.paper',
        pointerEvents: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          height: 64,
          alignItems: 'center',
          // px: 1,
          // pb: 'max(env(safe-area-inset-bottom), 0px)',
        }}
      >
        <NavButton
          icon={<HomeRounded fontSize="small" />}
          label="Home"
          active={value === 0}
          onClick={() => navigate({ to: '/dashboard' })}
        />
        <NavButton
          icon={<AccountBalanceRounded fontSize="small" />}
          label="Accounts"
          active={value === 1}
          onClick={() => navigate({ to: '/accounts'})}
        />

        {/* Centre column — the FAB sits above and the column stays empty */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            position: 'relative',
          }}
        >
          <Fab
            color="primary"
            size="medium"
            aria-label="new transaction"
            sx={{ position: 'absolute', top: -28, boxShadow: 4 }}
            onClick={() => navigate({ to: '/transactions/new' })}
          >
            <AddRounded fontSize="large" />
          </Fab>
        </Box>

        <NavButton
          icon={<CategoryRounded fontSize="small" />}
          label="Categories"
          active={value === 3}
          onClick={() => navigate({ to: '/categories' })}
        />
        <NavButton
          icon={<SettingsRounded fontSize="small" />}
          label="Settings"
          active={value === 4}
          onClick={() => navigate({ to: '/settings' })}
        />
      </Box>
    </Paper>
    </Box>
  )
}
