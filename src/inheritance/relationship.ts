import type { BoardData } from '../domain/simulation'

export function findSpouse(
  anggotaId: string,
  board: BoardData,
  tanggalKematian: string
): string | null {
  for (const hub of board.hubunganHorizontal) {
    if (hub.anggotaAId !== anggotaId && hub.anggotaBId !== anggotaId) continue

    const isMarried = hub.tanggalBerakhir === null || hub.tanggalBerakhir > tanggalKematian
    if (!isMarried) continue

    return hub.anggotaAId === anggotaId ? hub.anggotaBId : hub.anggotaAId
  }
  return null
}

export function findChildren(
  anggotaId: string,
  board: BoardData,
  tanggalKematian?: string
): string[] {
  const children: string[] = []

  for (const hub of board.hubunganHorizontal) {
    if (hub.anggotaAId !== anggotaId && hub.anggotaBId !== anggotaId) continue

    const hubChildren = board.hubunganVertical
      .filter(v => v.hubunganHorizontalId === hub.id)
      .filter(v => !tanggalKematian || v.tanggalLahir <= tanggalKematian)
      .map(v => v.anakId)

    children.push(...hubChildren)
  }

  return children
}

export function findParentsOf(
  anggotaId: string,
  board: BoardData
): { ayahId: string | null; ibuId: string | null } {
  const vert = board.hubunganVertical.find(v => v.anakId === anggotaId)
  if (!vert) return { ayahId: null, ibuId: null }

  const hub = board.hubunganHorizontal.find(h => h.id === vert.hubunganHorizontalId)
  if (!hub) return { ayahId: null, ibuId: null }

  return {
    ayahId: hub.anggotaAId,
    ibuId: hub.anggotaBId,
  }
}

export function findSiblings(
  anggotaId: string,
  board: BoardData
): string[] {
  const parents = findParentsOf(anggotaId, board)
  if (!parents.ayahId && !parents.ibuId) return []

  const siblings: string[] = []
  for (const vert of board.hubunganVertical) {
    if (vert.anakId === anggotaId) continue
    const hub = board.hubunganHorizontal.find(h => h.id === vert.hubunganHorizontalId)
    if (!hub) continue

    if (hub.anggotaAId === parents.ayahId || hub.anggotaBId === parents.ibuId) {
      siblings.push(vert.anakId)
    }
  }

  return siblings
}

export function getRelationship(
  fromId: string,
  toId: string,
  board: BoardData
): string | null {
  if (fromId === toId) return null

  const spouse = findSpouse(fromId, board, new Date().toISOString())
  if (spouse === toId) return 'Pasangan'

  const children = findChildren(fromId, board)
  if (children.includes(toId)) return 'Anak'

  const parents = findParentsOf(fromId, board)
  if (parents.ayahId === toId || parents.ibuId === toId) return 'Orang Tua'

  const siblings = findSiblings(fromId, board)
  if (siblings.includes(toId)) return 'Saudara'

  for (const childId of children) {
    const grandchildren = findChildren(childId, board)
    if (grandchildren.includes(toId)) return 'Cucu'
  }

  if (parents.ayahId) {
    const grandpa = findParentsOf(parents.ayahId, board)
    if (grandpa.ayahId === toId || grandpa.ibuId === toId) return 'Kakek/Nenek'
  }
  if (parents.ibuId) {
    const grandma = findParentsOf(parents.ibuId, board)
    if (grandma.ayahId === toId || grandma.ibuId === toId) return 'Kakek/Nenek'
  }

  return null
}
