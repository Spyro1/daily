import { Alert, Collapse, LinearProgress } from '@mui/material'
import { CloudOff, Sync } from '@mui/icons-material'
import { useOnlineStatus } from './useOnlineStatus'
import { usePendingSync } from './usePendingSync'

/**
 * A slim banner that appears at the top of the app when:
 * - The device is offline (with pending mutation count)
 * - Queued mutations are being synced back to the server
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const { pending, syncing } = usePendingSync()

  const showSyncing = isOnline && syncing
  const showOffline = !isOnline

  const visible = showOffline || showSyncing

  return (
    <Collapse in={visible}>
      {showSyncing ? (
        <Alert
          icon={<Sync fontSize="small" />}
          severity="info"
          sx={{ borderRadius: 0, py: 0 }}
        >
          Syncing {pending} offline change{pending !== 1 ? 's' : ''}…
          <LinearProgress sx={{ mt: 0.5 }} />
        </Alert>
      ) : showOffline ? (
        <Alert
          icon={<CloudOff fontSize="small" />}
          severity="warning"
          sx={{ borderRadius: 0, py: 0 }}
        >
          You&apos;re offline
          {pending > 0
            ? ` — ${pending} change${pending !== 1 ? 's' : ''} will sync when connected`
            : ' — changes will be saved locally'}
        </Alert>
      ) : null}
    </Collapse>
  )
}
