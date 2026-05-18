import type { SyncPushRequest, SyncPushResponse } from '@/api/generated'
import { syncApi } from '@/api/clients'

type LocalSyncPayload = Required<SyncPushRequest>

type DatabaseInfo = { name?: string }

const CANDIDATE_DB_NAMES = ['daily', 'daily_local', 'daily-local', 'daily-db']

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

function openDb(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error(`Failed to open IndexedDB database: ${name}`))
  })
}

async function resolveDbName(): Promise<string | null> {
  if (typeof indexedDB === 'undefined') return null

  const idb = indexedDB as IDBFactory & { databases?: () => Promise<DatabaseInfo[]> }
  if (typeof idb.databases !== 'function') return null

  const dbs = await idb.databases()

  // Prefer known legacy/current names first, then any DB containing "daily".
  const known = CANDIDATE_DB_NAMES.find((candidate) => dbs.some((db) => db.name === candidate))
  if (known) return known

  const match = dbs.find((db) => db.name && db.name.toLowerCase().includes('daily'))
  if (match?.name) return match.name

  return null
}

async function readStoreRecords(db: IDBDatabase, storeName: string): Promise<Record<string, unknown>[]> {
  if (!db.objectStoreNames.contains(storeName)) return []

  const tx = db.transaction(storeName, 'readonly')
  const store = tx.objectStore(storeName)
  const records = await requestToPromise(store.getAll())
  return Array.isArray(records) ? (records as Record<string, unknown>[]) : []
}

async function readLocalPayload(): Promise<LocalSyncPayload> {
  const dbName = await resolveDbName()
  if (!dbName) return { accounts: [], categories: [], transactions: [] }

  let db: IDBDatabase
  try {
    db = await openDb(dbName)
  } catch {
    return { accounts: [], categories: [], transactions: [] }
  }

  try {
    const [accounts, categories, transactions] = await Promise.all([
      readStoreRecords(db, 'accounts'),
      readStoreRecords(db, 'categories'),
      readStoreRecords(db, 'transactions'),
    ])

    return { accounts, categories, transactions }
  } finally {
    db.close()
  }
}

export async function hasLocalData(): Promise<boolean> {
  const payload = await readLocalPayload()
  return (
    payload.accounts.length > 0 ||
    payload.categories.length > 0 ||
    payload.transactions.length > 0
  )
}

export async function syncPushToBackend(): Promise<SyncPushResponse> {
  const payload = await readLocalPayload()
  const { data } = await syncApi.syncPushApiV1SyncPushPost(payload)
  return data
}
