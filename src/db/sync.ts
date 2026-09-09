import { openDB } from './connection'
import { STORE_NAMES } from './schema'
import type { Anggota } from '../domain/anggota'
import type { HubunganHorizontal } from '../domain/hubungan-horizontal'
import type { HubunganVertical } from '../domain/hubungan-vertical'
import type { Harta, PemilikHarta } from '../domain/harta'
import type { BoardData } from '../domain/simulation'

async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result as T[])
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

async function putAll<T>(storeName: string, items: T[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)

    for (const item of items) {
      store.put(item)
    }

    transaction.oncomplete = () => {
      resolve()
    }

    transaction.onerror = () => {
      reject(transaction.error)
    }
  })
}

async function clearStore(storeName: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.clear()

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export async function loadAllData(): Promise<BoardData> {
  const [anggota, hubunganHorizontal, hubunganVertical, harta, pemilikHarta] =
    await Promise.all([
      getAll<Anggota>(STORE_NAMES.anggota),
      getAll<HubunganHorizontal>(STORE_NAMES.hubunganHorizontal),
      getAll<HubunganVertical>(STORE_NAMES.hubunganVertical),
      getAll<Harta>(STORE_NAMES.harta),
      getAll<PemilikHarta>(STORE_NAMES.pemilikHarta),
    ])

  return {
    anggota,
    hubunganHorizontal,
    hubunganVertical,
    harta,
    pemilikHarta,
  }
}

export async function saveAllData(data: BoardData): Promise<void> {
  await Promise.all([
    clearStore(STORE_NAMES.anggota),
    clearStore(STORE_NAMES.hubunganHorizontal),
    clearStore(STORE_NAMES.hubunganVertical),
    clearStore(STORE_NAMES.harta),
    clearStore(STORE_NAMES.pemilikHarta),
  ])

  await Promise.all([
    putAll(STORE_NAMES.anggota, data.anggota),
    putAll(STORE_NAMES.hubunganHorizontal, data.hubunganHorizontal),
    putAll(STORE_NAMES.hubunganVertical, data.hubunganVertical),
    putAll(STORE_NAMES.harta, data.harta),
    putAll(STORE_NAMES.pemilikHarta, data.pemilikHarta),
  ])
}
