/**
 * IndexedDB-based queue for storing mutations made while offline.
 * Mutations are stored with their full request details and replayed
 * in FIFO order when connectivity is restored.
 */

const DB_NAME = 'daily-offline'
const STORE_NAME = 'mutation-queue'
const DB_VERSION = 1

export interface QueuedMutation {
  id: string
  timestamp: number
  method: string
  url: string
  data?: unknown
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      dbPromise = null
      reject(request.error)
    }
  })

  return dbPromise
}

/** Add a mutation to the offline queue. */
export async function enqueue(
  mutation: Pick<QueuedMutation, 'method' | 'url' | 'data'>,
): Promise<QueuedMutation> {
  const db = await openDB()
  const entry: QueuedMutation = {
    ...mutation,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).add(entry)
    tx.oncomplete = () => resolve(entry)
    tx.onerror = () => reject(tx.error)
  })
}

/** Remove a single mutation from the queue by id. */
export async function dequeue(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Return every queued mutation sorted oldest-first. */
export async function getAll(): Promise<QueuedMutation[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).getAll()
    request.onsuccess = () => {
      const entries = (request.result as QueuedMutation[]).sort(
        (a, b) => a.timestamp - b.timestamp,
      )
      resolve(entries)
    }
    request.onerror = () => reject(request.error)
  })
}

/** Return the number of mutations currently in the queue. */
export async function count(): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).count()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/** Remove all mutations from the queue. */
export async function clear(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
