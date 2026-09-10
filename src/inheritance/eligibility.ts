import type { BoardData } from '../domain/simulation'
import type { Candidate, EligibleHeir } from './result'

export function checkEligibility(
  candidates: Candidate[],
  board: BoardData,
  tanggalWarisan: string
): EligibleHeir[] {
  return candidates.map(candidate => ({
    ...candidate,
    isAlive: isAliveAtDeath(candidate.anggotaId, board, tanggalWarisan),
  }))
}

function isAliveAtDeath(
  anggotaId: string,
  board: BoardData,
  tanggalWarisan: string
): boolean {
  const anggota = board.anggota.find(a => a.id === anggotaId)
  if (anggota?.tanggalKematian) {
    return anggota.tanggalKematian > tanggalWarisan
  }

  return true
}
