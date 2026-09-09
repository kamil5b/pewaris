import { useEffect, useRef } from 'react'
import { useFamilyStore } from '../store/family-store'
import { useAssetStore } from '../store/asset-store'
import { saveAllData } from './sync'

export function useAutoSave() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unsubscribe = useFamilyStore.subscribe(() => {
      debouncedSave()
    })

    const unsubscribeAsset = useAssetStore.subscribe(() => {
      debouncedSave()
    })

    const handleBeforeUnload = () => {
      save()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      unsubscribe()
      unsubscribeAsset()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  function debouncedSave() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      save()
    }, 500)
  }

  function save() {
    const familyState = useFamilyStore.getState()
    const assetState = useAssetStore.getState()

    const data = {
      anggota: familyState.anggota,
      hubunganHorizontal: familyState.hubunganHorizontal,
      hubunganVertical: familyState.hubunganVertical,
      harta: assetState.harta,
      pemilikHarta: assetState.pemilikHarta,
    }

    saveAllData(data).catch(console.error)
  }
}
