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
  if (typeof idb.databases === 'function') {
    const dbs = await idb.databases()
    const match = dbs.find((db) => db.name && db.name.toLowerCase().includes('daily'))
    if (match?.name) return match.name
  }

  return CANDIDATE_DB_NAMES[0] ?? null
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

  const db = await openDb(dbName)
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
