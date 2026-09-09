import type { BoardData } from '../domain/simulation'
import type { RelationshipType } from './result'

export function getRelationship(
  fromId: string,
  toId: string,
  board: BoardData
): RelationshipType | null {
  if (fromId === toId) return null

  for (const hub of board.hubunganHorizontal) {
    const isA = hub.anggotaAId === fromId && hub.anggotaBId === toId
    const isB = hub.anggotaAId === toId && hub.anggotaBId === fromId

    if (isA || isB) {
      const isMarried = hub.tanggalBerakhir === null
      if (isMarried) {
        return isA ? 'SUAMI' : 'ISTRI'
      }
    }
  }

  for (const vert of board.hubunganVertical) {
    if (vert.anakId === fromId) {
      const hub = board.hubunganHorizontal.find(h => h.id === vert.hubunganHorizontalId)
      if (hub) {
        if (hub.anggotaAId === toId) return 'ANAK_LAKI'
        if (hub.anggotaBId === toId) return 'ANAK_PEREMPUAN'
      }
    }
    if (vert.anakId === toId) {
      const hub = board.hubunganHorizontal.find(h => h.id === vert.hubunganHorizontalId)
      if (hub) {
        if (hub.anggotaAId === fromId) return 'AYAH'
        if (hub.anggotaBId === fromId) return 'IBU'
      }
    }
  }

  const fromParents = findParents(fromId, board)
  const toParents = findParents(toId, board)

  for (const fp of fromParents) {
    for (const tp of toParents) {
      if (fp.hubunganHorizontalId === tp.hubunganHorizontalId && fp.anakId !== tp.anakId) {
        const fromGender = getGender(fp.anakId, board)
        return fromGender === 'LAKI' ? 'SAUDARA_LAKI' : 'SAUDARA_PEREMPUAN'
      }
    }
  }

  for (const vert of board.hubunganVertical) {
    if (vert.anakId === fromId) {
      const hub = board.hubunganHorizontal.find(h => h.id === vert.hubunganHorizontalId)
      if (hub) {
        const parentAChildren = board.hubunganVertical
          .filter(v => v.hubunganHorizontalId === hub.id && v.anakId !== fromId)
        
        for (const sibling of parentAChildren) {
          const siblingParents = findParents(sibling.anakId, board)
          for (const sp of siblingParents) {
            if (sp.anakId === toId) {
              const gender = getGender(fromId, board)
              return gender === 'LAKI' ? 'CUCU_LAKI' : 'CUCU_PEREMPUAN'
            }
          }
        }
      }
    }
  }

  for (const vert of board.hubunganVertical) {
    if (vert.anakId === toId) {
      const hub = board.hubunganHorizontal.find(h => h.id === vert.hubunganHorizontalId)
      if (hub) {
        const parentA = hub.anggotaAId
        const parentB = hub.anggotaBId

        const grandpaA = findParents(parentA, board)
        const grandmaA = findParents(parentB, board)

        for (const gp of [...grandpaA, ...grandmaA]) {
          if (gp.anakId === fromId) {
            return getGender(fromId, board) === 'LAKI' ? 'KAKEK' : 'NENEK'
          }
        }
      }
    }
  }

  return null
}

function findParents(
  childId: string,
  board: BoardData
): { anakId: string; hubunganHorizontalId: string }[] {
  return board.hubunganVertical.filter(v => v.anakId === childId)
}

function getGender(
  anggotaId: string,
  board: BoardData
): 'LAKI' | 'PEREMPUAN' {
  const anggota = board.anggota.find(a => a.id === anggotaId)
  return anggota?.gender === 'PEREMPUAN' ? 'PEREMPUAN' : 'LAKI'
}

export function findSpouse(
  anggotaId: string,
  board: BoardData,
  tanggalKematian: string
): string | null {
  for (const hub of board.hubunganHorizontal) {
    const isActive = hub.tanggalBerakhir === null || hub.tanggalBerakhir > tanggalKematian
    if (!isActive) continue

    if (hub.anggotaAId === anggotaId) return hub.anggotaBId
    if (hub.anggotaBId === anggotaId) return hub.anggotaAId
  }
  return null
}

export function findChildren(
  anggotaId: string,
  board: BoardData
): string[] {
  const children: string[] = []

  for (const hub of board.hubunganHorizontal) {
    if (hub.anggotaAId !== anggotaId && hub.anggotaBId !== anggotaId) continue

    const hubChildren = board.hubunganVertical
      .filter(v => v.hubunganHorizontalId === hub.id)
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
