import { DB_NAME, DB_VERSION, STORE_NAMES } from './schema'

let dbInstance: IDBDatabase | null = null

export function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance)
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORE_NAMES.anggota)) {
        db.createObjectStore(STORE_NAMES.anggota, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(STORE_NAMES.hubunganHorizontal)) {
        db.createObjectStore(STORE_NAMES.hubunganHorizontal, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(STORE_NAMES.hubunganVertical)) {
        db.createObjectStore(STORE_NAMES.hubunganVertical, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(STORE_NAMES.harta)) {
        db.createObjectStore(STORE_NAMES.harta, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(STORE_NAMES.pemilikHarta)) {
        db.createObjectStore(STORE_NAMES.pemilikHarta, { keyPath: 'id' })
      }
    }
  })
}

export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
