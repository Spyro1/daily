import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { Alert, Slide, Snackbar } from '@mui/material'
import type { AlertColor } from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'
import { notificationService } from '#/api/notificationService'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SnackbarMessage {
  id: number
  message: string
  severity: AlertColor
}

export type NotifyFn = (message: string, severity?: AlertColor) => void

interface NotifyContextValue {
  notify: NotifyFn
}

// ─── Context ───────────────────────────────────────────────────────────────────

const NotifyContext = createContext<NotifyContextValue | null>(null)

export function useNotify(): NotifyFn {
  const ctx = useContext(NotifyContext)
  if (!ctx) throw new Error('useNotify must be used inside <SnackbarProvider>')
  return ctx.notify
}

// ─── Transition ────────────────────────────────────────────────────────────────

function SlideUp(props: TransitionProps & { children: React.ReactElement }) {
  return <Slide {...props} direction="up" />
}

// ─── Provider ──────────────────────────────────────────────────────────────────

let _idCounter = 0

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<SnackbarMessage[]>([])
  const [current, setCurrent] = useState<SnackbarMessage | null>(null)
  const [open, setOpen] = useState(false)
  const processingRef = useRef(false)

  // Drain the queue one message at a time
  useEffect(() => {
    if (processingRef.current || open || queue.length === 0) return
    const next = queue[0]!
    processingRef.current = true
    setCurrent(next)
    setQueue((q) => q.slice(1))
    setOpen(true)
  }, [open, queue])

  const notify = useCallback<NotifyFn>((message, severity = 'info') => {
    setQueue((q) => [...q, { id: ++_idCounter, message, severity }])
  }, [])

  // Bridge: lets axios interceptors call notify without React context
  useEffect(() => {
    notificationService.setHandler(notify)
  }, [notify])

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return
    setOpen(false)
  }

  const handleExited = () => {
    processingRef.current = false
  }

  return (
    <NotifyContext.Provider value={{ notify }}>
      {children}

      <Snackbar
        open={open}
        onClose={handleClose}
        TransitionComponent={SlideUp}
        TransitionProps={{ onExited: handleExited }}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          // Sit above the bottom navigation (≈ 64 px) plus a small gap
          bottom: { xs: 72, sm: 72 },
          maxWidth: 480,
          width: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          right: 'auto',
        }}
      >
        {current ? (
          <Alert
            severity={current.severity}
            variant="filled"
            onClose={handleClose}
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotifyContext.Provider>
  )
}
