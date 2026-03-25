import { Alert, Button, Collapse } from '@mui/material'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Registers the service worker and prompts the user to reload
 * when a new version is available.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Check for SW updates every hour
      if (registration) {
        setInterval(
          () => {
            void registration.update()
          },
          60 * 60 * 1000,
        )
      }
    },
  })

  if (!needRefresh) return null

  return (
    <Collapse in={needRefresh}>
      <Alert
        severity="info"
        sx={{ borderRadius: 0, py: 0 }}
        action={
          <>
            <Button
              size="small"
              onClick={() => void updateServiceWorker(true)}
            >
              Update
            </Button>
            <Button size="small" onClick={() => setNeedRefresh(false)}>
              Later
            </Button>
          </>
        }
      >
        A new version of Daily is available
      </Alert>
    </Collapse>
  )
}
