import { create } from 'zustand'
import type { Anggota } from '../domain/anggota'
import type { HubunganHorizontal } from '../domain/hubungan-horizontal'
import type { HubunganVertical } from '../domain/hubungan-vertical'

type FamilyState = {
  anggota: Anggota[]
  hubunganHorizontal: HubunganHorizontal[]
  hubunganVertical: HubunganVertical[]

  addAnggota: (anggota: Anggota) => void
  updateAnggota: (id: string, data: Partial<Anggota>) => void
  removeAnggota: (id: string) => void

  addHubunganHorizontal: (hub: HubunganHorizontal) => void
  updateHubunganHorizontal: (id: string, data: Partial<HubunganHorizontal>) => void
  removeHubunganHorizontal: (id: string) => void

  addHubunganVertical: (hub: HubunganVertical) => void
  updateHubunganVertical: (id: string, data: Partial<HubunganVertical>) => void
  removeHubunganVertical: (id: string) => void

  loadState: (state: {
    anggota: Anggota[]
    hubunganHorizontal: HubunganHorizontal[]
    hubunganVertical: HubunganVertical[]
  }) => void
}

export const useFamilyStore = create<FamilyState>((set) => ({
  anggota: [],
  hubunganHorizontal: [],
  hubunganVertical: [],

  addAnggota: (anggota) =>
    set((state) => ({
      anggota: [...state.anggota, anggota],
    })),

  updateAnggota: (id, data) =>
    set((state) => ({
      anggota: state.anggota.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    })),

  removeAnggota: (id) =>
    set((state) => ({
      anggota: state.anggota.filter((a) => a.id !== id),
      hubunganHorizontal: state.hubunganHorizontal.filter(
        (h) => h.anggotaAId !== id && h.anggotaBId !== id
      ),
      hubunganVertical: state.hubunganVertical.filter(
        (v) => v.anakId !== id
      ),
    })),

  addHubunganHorizontal: (hub) => {
    const hasDuplicate = useFamilyStore.getState().hubunganHorizontal.some(
      (h) =>
        (h.anggotaAId === hub.anggotaAId && h.anggotaBId === hub.anggotaBId) ||
        (h.anggotaAId === hub.anggotaBId && h.anggotaBId === hub.anggotaAId)
    )
    if (hasDuplicate) return
    set((state) => ({
      hubunganHorizontal: [...state.hubunganHorizontal, hub],
    }))
  },

  updateHubunganHorizontal: (id, data) =>
    set((state) => ({
      hubunganHorizontal: state.hubunganHorizontal.map((h) =>
        h.id === id ? { ...h, ...data } : h
      ),
    })),

  removeHubunganHorizontal: (id) =>
    set((state) => ({
      hubunganHorizontal: state.hubunganHorizontal.filter((h) => h.id !== id),
      hubunganVertical: state.hubunganVertical.filter(
        (v) => v.hubunganHorizontalId !== id
      ),
    })),

  addHubunganVertical: (hub) => {
    const hasDuplicate = useFamilyStore.getState().hubunganVertical.some(
      (v) =>
        v.anakId === hub.anakId &&
        v.hubunganHorizontalId === hub.hubunganHorizontalId
    )
    if (hasDuplicate) return
    set((state) => ({
      hubunganVertical: [...state.hubunganVertical, hub],
    }))
  },

  updateHubunganVertical: (id, data) =>
    set((state) => ({
      hubunganVertical: state.hubunganVertical.map((v) =>
        v.id === id ? { ...v, ...data } : v
      ),
    })),

  removeHubunganVertical: (id) =>
    set((state) => ({
      hubunganVertical: state.hubunganVertical.filter((v) => v.id !== id),
    })),

  loadState: (state) =>
    set({
      anggota: state.anggota,
      hubunganHorizontal: state.hubunganHorizontal,
      hubunganVertical: state.hubunganVertical,
    }),
}))
