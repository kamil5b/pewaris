import { create } from 'zustand'
import type { Harta, PemilikHarta } from '../domain/harta'

type AssetState = {
  harta: Harta[]
  pemilikHarta: PemilikHarta[]

  addHarta: (harta: Harta) => void
  updateHarta: (id: string, data: Partial<Harta>) => void
  removeHarta: (id: string) => void

  addPemilikHarta: (pemilik: PemilikHarta) => void
  updatePemilikHarta: (id: string, data: Partial<PemilikHarta>) => void
  removePemilikHarta: (id: string) => void

  loadState: (state: {
    harta: Harta[]
    pemilikHarta: PemilikHarta[]
  }) => void
}

export const useAssetStore = create<AssetState>((set) => ({
  harta: [],
  pemilikHarta: [],

  addHarta: (harta) =>
    set((state) => ({
      harta: [...state.harta, harta],
    })),

  updateHarta: (id, data) =>
    set((state) => ({
      harta: state.harta.map((h) =>
        h.id === id ? { ...h, ...data } : h
      ),
    })),

  removeHarta: (id) =>
    set((state) => ({
      harta: state.harta.filter((h) => h.id !== id),
      pemilikHarta: state.pemilikHarta.filter((p) => p.hartaId !== id),
    })),

  addPemilikHarta: (pemilik) =>
    set((state) => ({
      pemilikHarta: [...state.pemilikHarta, pemilik],
    })),

  updatePemilikHarta: (id, data) =>
    set((state) => ({
      pemilikHarta: state.pemilikHarta.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),

  removePemilikHarta: (id) =>
    set((state) => ({
      pemilikHarta: state.pemilikHarta.filter((p) => p.id !== id),
    })),

  loadState: (state) =>
    set({
      harta: state.harta,
      pemilikHarta: state.pemilikHarta,
    }),
}))
