import { useState, useEffect } from 'react'
import { useFamilyStore } from '../store/family-store'
import { useAssetStore } from '../store/asset-store'
import { loadAllData } from './sync'

export function useLoadData() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await loadAllData()

        useFamilyStore.getState().loadState({
          anggota: data.anggota,
          hubunganHorizontal: data.hubunganHorizontal,
          hubunganVertical: data.hubunganVertical,
        })

        useAssetStore.getState().loadState({
          harta: data.harta,
          pemilikHarta: data.pemilikHarta,
        })

        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'))
        setIsLoading(false)
      }
    }

    load()
  }, [])

  return { isLoading, error }
}
