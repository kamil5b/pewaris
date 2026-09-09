import type { BoardData } from '../domain/simulation'
import type { Candidate, EligibleHeir } from './result'

export function checkEligibility(
  candidates: Candidate[],
  board: BoardData,
  tanggalKematian: string
): EligibleHeir[] {
  return candidates.map(candidate => ({
    ...candidate,
    isAlive: isAliveAtDeath(candidate.anggotaId, board, tanggalKematian),
  }))
}

function isAliveAtDeath(
  anggotaId: string,
  board: BoardData,
  tanggalKematian: string
): boolean {
  for (const hub of board.hubunganHorizontal) {
    if (hub.anggotaAId !== anggotaId && hub.anggotaBId !== anggotaId) continue
    if (hub.jenisAkhir !== 'CERAI_MATI') continue
    if (!hub.tanggalBerakhir) continue
    if (hub.tanggalBerakhir <= tanggalKematian) return false
  }

  return true
}
