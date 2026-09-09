import type { BoardData } from '../domain/simulation'
import type { Candidate } from './result'
import {
  getRelationship,
  findSpouse,
  findChildren,
  findParentsOf,
  findSiblings,
} from './relationship'

export function resolveCandidates(
  pewarisId: string,
  board: BoardData
): Candidate[] {
  const candidates: Candidate[] = []
  const added = new Set<string>()

  const spouse = findSpouse(pewarisId, board, new Date().toISOString())
  if (spouse && !added.has(spouse)) {
    const rel = getRelationship(spouse, pewarisId, board)
    if (rel === 'SUAMI' || rel === 'ISTRI') {
      candidates.push({ anggotaId: spouse, hubungan: rel })
      added.add(spouse)
    }
  }

  const children = findChildren(pewarisId, board)
  for (const childId of children) {
    if (added.has(childId)) continue
    const rel = getRelationship(childId, pewarisId, board)
    if (rel === 'ANAK_LAKI' || rel === 'ANAK_PEREMPUAN') {
      candidates.push({ anggotaId: childId, hubungan: rel })
      added.add(childId)
    }
  }

  const parents = findParentsOf(pewarisId, board)
  if (parents.ayahId && !added.has(parents.ayahId)) {
    candidates.push({ anggotaId: parents.ayahId, hubungan: 'AYAH' })
    added.add(parents.ayahId)
  }
  if (parents.ibuId && !added.has(parents.ibuId)) {
    candidates.push({ anggotaId: parents.ibuId, hubungan: 'IBU' })
    added.add(parents.ibuId)
  }

  const siblings = findSiblings(pewarisId, board)
  for (const siblingId of siblings) {
    if (added.has(siblingId)) continue
    const rel = getRelationship(siblingId, pewarisId, board)
    if (rel === 'SAUDARA_LAKI' || rel === 'SAUDARA_PEREMPUAN') {
      candidates.push({ anggotaId: siblingId, hubungan: rel })
      added.add(siblingId)
    }
  }

  if (parents.ayahId) {
    const grandpa = findParentsOf(parents.ayahId, board)
    if (grandpa.ayahId && !added.has(grandpa.ayahId)) {
      candidates.push({ anggotaId: grandpa.ayahId, hubungan: 'KAKEK' })
      added.add(grandpa.ayahId)
    }
    if (grandpa.ibuId && !added.has(grandpa.ibuId)) {
      candidates.push({ anggotaId: grandpa.ibuId, hubungan: 'NENEK' })
      added.add(grandpa.ibuId)
    }
  }
  if (parents.ibuId) {
    const grandma = findParentsOf(parents.ibuId, board)
    if (grandma.ayahId && !added.has(grandma.ayahId)) {
      candidates.push({ anggotaId: grandma.ayahId, hubungan: 'KAKEK' })
      added.add(grandma.ayahId)
    }
    if (grandma.ibuId && !added.has(grandma.ibuId)) {
      candidates.push({ anggotaId: grandma.ibuId, hubungan: 'NENEK' })
      added.add(grandma.ibuId)
    }
  }

  for (const childId of children) {
    const grandchildren = findChildren(childId, board)
    for (const gcId of grandchildren) {
      if (added.has(gcId)) continue
      const rel = getRelationship(gcId, pewarisId, board)
      if (rel === 'CUCU_LAKI' || rel === 'CUCU_PEREMPUAN') {
        candidates.push({ anggotaId: gcId, hubungan: rel })
        added.add(gcId)
      }
    }
  }

  return candidates
}
