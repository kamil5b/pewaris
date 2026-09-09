import { useFamilyStore } from '../../store/family-store'
import type { BoardData } from '../../domain/simulation'

export function validateConnection(
  fromId: string,
  toId: string,
  connectionType: 'MARRIAGE' | 'PARENT_CHILD'
): { valid: boolean; error?: string } {
  if (fromId === toId) {
    return { valid: false, error: 'Tidak bisa menghubungkan ke diri sendiri' }
  }

  const board = getBoardData()

  if (connectionType === 'MARRIAGE') {
    const existingMarriage = board.hubunganHorizontal.find(
      (h) =>
        (h.anggotaAId === fromId && h.anggotaBId === toId) ||
        (h.anggotaAId === toId && h.anggotaBId === fromId)
    )

    if (existingMarriage) {
      return { valid: false, error: 'Sudah ada hubungan perkawinan' }
    }
  }

  if (connectionType === 'PARENT_CHILD') {
    const existingParentChild = board.hubunganVertical.find(
      (v) => v.anakId === toId
    )

    if (existingParentChild) {
      return { valid: false, error: 'Anak sudah memiliki orang tua' }
    }
  }

  return { valid: true }
}

function getBoardData(): BoardData {
  const state = useFamilyStore.getState()
  return {
    anggota: state.anggota,
    hubunganHorizontal: state.hubunganHorizontal,
    hubunganVertical: state.hubunganVertical,
    harta: [],
    pemilikHarta: [],
  }
}
