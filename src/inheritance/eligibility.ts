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
  const anggota = board.anggota.find(a => a.id === anggotaId)
  if (anggota?.tanggalKematian) {
    return anggota.tanggalKematian > tanggalKematian
  }

  return true
}
