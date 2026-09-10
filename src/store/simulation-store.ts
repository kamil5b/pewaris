import { create } from 'zustand'
import type { InheritanceResult } from '../inheritance/result'
import { simulateInheritance } from '../inheritance/calculate'
import { useFamilyStore } from './family-store'
import { useAssetStore } from './asset-store'

type SimulationState = {
  pewarisId: string | null
  tanggalWarisan: string

  setPewaris: (id: string | null) => void
  setTanggalWarisan: (date: string) => void

  result: InheritanceResult | null
  calculate: () => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  pewarisId: null,
  tanggalWarisan: new Date().toISOString().split('T')[0],

  setPewaris: (id) => set({ pewarisId: id }),
  setTanggalWarisan: (date) => set({ tanggalWarisan: date }),

  result: null,

  calculate: () => {
    const { pewarisId, tanggalWarisan } = useSimulationStore.getState()
    if (!pewarisId) {
      set({ result: null })
      return
    }

    const familyState = useFamilyStore.getState()
    const assetState = useAssetStore.getState()

    const board = {
      anggota: familyState.anggota,
      hubunganHorizontal: familyState.hubunganHorizontal,
      hubunganVertical: familyState.hubunganVertical,
      harta: assetState.harta,
      pemilikHarta: assetState.pemilikHarta,
    }

    const context = {
      pewarisId,
      tanggalWarisan,
    }

    const result = simulateInheritance(board, context)
    set({ result })
  },
}))
