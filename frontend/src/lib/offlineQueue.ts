type CreateMutationType = 'create-account' | 'create-category' | 'create-transaction'
type UpdateMutationType = 'update-account' | 'update-category' | 'update-transaction'
type DeleteMutationType = 'delete-account' | 'delete-category' | 'delete-transaction'

type OfflineMutation =
  | { type: CreateMutationType; data: unknown; queuedAt: string }
  | { type: UpdateMutationType; id: string; data: unknown; queuedAt: string }
  | { type: DeleteMutationType; id: string; queuedAt: string }

const STORAGE_KEY = 'daily.offline.mutations'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readQueue(): OfflineMutation[] {
  if (!canUseStorage()) return []

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as OfflineMutation[]) : []
  } catch {
    return []
  }
}

function writeQueue(queue: OfflineMutation[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
}

export function isOffline() {
  if (typeof navigator === 'undefined') return false
  return !navigator.onLine
}

export function enqueueMutation(mutation: Omit<OfflineMutation, 'queuedAt'>) {
  const queue = readQueue()
  queue.push({ ...mutation, queuedAt: new Date().toISOString() })
  writeQueue(queue)
}

export function setupOfflineSync(onSynced: (count: number) => void) {
  if (typeof window === 'undefined') return () => {}

  const flush = () => {
    if (isOffline()) return
    const queue = readQueue()
    if (queue.length === 0) return
    onSynced(queue.length)
  }

  window.addEventListener('online', flush)
  flush()

  return () => {
    window.removeEventListener('online', flush)
  }
}
