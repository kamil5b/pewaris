import type { BoardData } from '../domain/simulation'
import type { Candidate } from './result'
import { findSpouse, findChildren } from './relationship'

export function resolveCandidates(
  pewarisId: string,
  board: BoardData,
  tanggalKematian: string
): Candidate[] {
  const candidates: Candidate[] = []
  const added = new Set<string>()

  const spouse = findSpouse(pewarisId, board, tanggalKematian)
  if (spouse && !added.has(spouse)) {
    candidates.push({ anggotaId: spouse })
    added.add(spouse)
  }

  const children = findChildren(pewarisId, board)
  for (const childId of children) {
    if (added.has(childId)) continue

    const childAnggota = board.anggota.find(a => a.id === childId)
    const isChildAlive = childAnggota?.tanggalKematian
      ? childAnggota.tanggalKematian > tanggalKematian
      : true

    if (isChildAlive) {
      candidates.push({ anggotaId: childId })
      added.add(childId)
    } else {
      const grandchildren = findChildren(childId, board)
      for (const gcId of grandchildren) {
        if (added.has(gcId)) continue

        const gcAnggota = board.anggota.find(a => a.id === gcId)
        const isGcAlive = gcAnggota?.tanggalKematian
          ? gcAnggota.tanggalKematian > tanggalKematian
          : true

        if (!isGcAlive) continue

        candidates.push({ anggotaId: gcId })
        added.add(gcId)
      }
    }
  }

  return candidates
}
