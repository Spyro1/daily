/**
 * Local-mode auth context.
 *
 * Manages whether the user is in "local" (offline / IndexedDB) mode or
 * "online" (authenticated via Google, using the backend API).
 *
 * The context is available app-wide through `<LocalAuthProvider>` and
 * consumed via the `useLocalAuth()` hook.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { localDb } from '@/lib/localDb'
import type { LocalUserProfile } from '@/lib/localDb'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AuthMode = 'undetermined' | 'local' | 'online' | 'none'

export interface LocalAuthContextValue {
  /** Current auth mode: local (IndexedDB), online (Google), or none (not logged in). */
  mode: AuthMode
  /** The local user profile (only set when mode === 'local'). */
  localUser: LocalUserProfile | null
  /** Create or resume a local user session. */
  loginLocal: (displayName: string, email: string) => Promise<void>
  /** Sign out of local mode and clear profile. */
  logoutLocal: () => Promise<void>
  /** Mark that the user authenticated via Google (online). */
  setOnline: () => void
  /** Clear all local data (after a successful sync push). */
  clearLocalData: () => Promise<void>
}

// ─── Context ───────────────────────────────────────────────────────────────────

const LocalAuthContext = createContext<LocalAuthContextValue | null>(null)

export function useLocalAuth(): LocalAuthContextValue {
  const ctx = useContext(LocalAuthContext)
  if (!ctx) throw new Error('useLocalAuth must be used inside <LocalAuthProvider>')
  return ctx
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode>('undetermined')
  const [localUser, setLocalUser] = useState<LocalUserProfile | null>(null)

  // On mount, check if a local profile already exists in IndexedDB
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const profile = await localDb.profile.get('local')
        if (!cancelled) {
          if (profile) {
            setLocalUser(profile)
            setMode('local')
          } else {
            // No local profile — mode stays 'none' until AuthGuard decides
            setMode('none')
          }
        }
      } catch {
        if (!cancelled) setMode('none')
      }
    })()
    return () => { cancelled = true }
  }, [])

  const loginLocal = useCallback(async (displayName: string, email: string) => {
    const now = new Date().toISOString()
    const profile: LocalUserProfile = {
      key: 'local',
      display_name: displayName,
      email,
      created_at: now,
    }
    await localDb.profile.put(profile)
    setLocalUser(profile)
    setMode('local')
  }, [])

  const logoutLocal = useCallback(async () => {
    await localDb.profile.delete('local')
    setLocalUser(null)
    setMode('none')
  }, [])

  const setOnline = useCallback(() => {
    setMode('online')
    setLocalUser(null)
  }, [])

  const clearLocalData = useCallback(async () => {
    await localDb.transaction('rw', [localDb.accounts, localDb.categories, localDb.transactions, localDb.profile], async () => {
      await localDb.accounts.clear()
      await localDb.categories.clear()
      await localDb.transactions.clear()
      await localDb.profile.delete('local')
    })
    setLocalUser(null)
  }, [])

  const value = useMemo<LocalAuthContextValue>(
    () => ({ mode, localUser, loginLocal, logoutLocal, setOnline, clearLocalData }),
    [mode, localUser, loginLocal, logoutLocal, setOnline, clearLocalData],
  )

  return (
    <LocalAuthContext.Provider value={value}>
      {children}
    </LocalAuthContext.Provider>
  )
}
