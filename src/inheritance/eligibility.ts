import type { BoardData } from '../domain/simulation'
import type { Candidate, EligibleHeir } from './result'

export type EligibilityReason =
  | 'MENINGGAL_SEBELUM_PEWARIS'
  | 'HIDUP'
  | 'LAHIR_SEBELUM_TANGGAL_WARISAN'

export function checkEligibility(
  candidates: Candidate[],
  board: BoardData,
  tanggalWarisan: string
): EligibleHeir[] {
  return candidates.map(candidate => {
    const anggota = board.anggota.find(a => a.id === candidate.anggotaId)
    const isAlive = anggota
      ? isAliveAtDeath(anggota, tanggalWarisan)
      : false

    return {
      ...candidate,
      isAlive,
    }
  })
}

function isAliveAtDeath(
  anggota: { tanggalKematian: string | null; tanggalLahir: string },
  tanggalWarisan: string
): boolean {
  if (anggota.tanggalLahir > tanggalWarisan) return false
  if (anggota.tanggalKematian && anggota.tanggalKematian <= tanggalWarisan) return false
  return true
}
