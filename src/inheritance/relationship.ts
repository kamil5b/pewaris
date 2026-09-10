import type { BoardData } from '../domain/simulation'

export function findSpouses(
  anggotaId: string,
  board: BoardData,
  tanggalKematian: string
): string[] {
  const spouses: string[] = []

  for (const hub of board.hubunganHorizontal) {
    if (hub.anggotaAId !== anggotaId && hub.anggotaBId !== anggotaId) continue

    const isMarried = hub.tanggalMulaiSah !== null
      && (hub.tanggalBerakhirSah === null || hub.tanggalBerakhirSah > tanggalKematian)
    if (!isMarried) continue

    const spouseId = hub.anggotaAId === anggotaId ? hub.anggotaBId : hub.anggotaAId
    spouses.push(spouseId)
  }

  return spouses
}

export function findSpouse(
  anggotaId: string,
  board: BoardData,
  tanggalKematian: string
): string | null {
  const spouses = findSpouses(anggotaId, board, tanggalKematian)
  return spouses.length > 0 ? spouses[0] : null
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
      .filter(v => !v.isAdopted)
      .filter(v => {
        if (!tanggalKematian) return true
        const childAnggota = board.anggota.find(a => a.id === v.anakId)
        return childAnggota && childAnggota.tanggalLahir <= tanggalKematian
      })
      .map(v => v.anakId)

    children.push(...hubChildren)
  }

  return children
}

export function findSons(
  anggotaId: string,
  board: BoardData,
  tanggalKematian?: string
): string[] {
  return findChildren(anggotaId, board, tanggalKematian).filter(id => {
    const a = board.anggota.find(x => x.id === id)
    return a?.gender === 'LAKI_LAKI'
  })
}

export function findDaughters(
  anggotaId: string,
  board: BoardData,
  tanggalKematian?: string
): string[] {
  return findChildren(anggotaId, board, tanggalKematian).filter(id => {
    const a = board.anggota.find(x => x.id === id)
    return a?.gender === 'PEREMPUAN'
  })
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

export function findFather(anggotaId: string, board: BoardData): string | null {
  return findParentsOf(anggotaId, board).ayahId
}

export function findMother(anggotaId: string, board: BoardData): string | null {
  return findParentsOf(anggotaId, board).ibuId
}

export function findSiblingsKandung(anggotaId: string, board: BoardData): string[] {
  const parents = findParentsOf(anggotaId, board)
  if (!parents.ayahId || !parents.ibuId) return []

  const siblings: string[] = []
  for (const vert of board.hubunganVertical) {
    if (vert.anakId === anggotaId) continue
    const hub = board.hubunganHorizontal.find(h => h.id === vert.hubunganHorizontalId)
    if (!hub) continue

    if (hub.anggotaAId === parents.ayahId && hub.anggotaBId === parents.ibuId) {
      siblings.push(vert.anakId)
    }
  }

  return siblings
}

export function findSiblingsSeayah(anggotaId: string, board: BoardData): string[] {
  const parents = findParentsOf(anggotaId, board)
  if (!parents.ayahId) return []

  const kandung = findSiblingsKandung(anggotaId, board)

  const siblings: string[] = []
  for (const vert of board.hubunganVertical) {
    if (vert.anakId === anggotaId) continue
    if (kandung.includes(vert.anakId)) continue
    const hub = board.hubunganHorizontal.find(h => h.id === vert.hubunganHorizontalId)
    if (!hub) continue

    if (hub.anggotaAId === parents.ayahId) {
      siblings.push(vert.anakId)
    }
  }

  return siblings
}

export function findSiblingsSeibu(anggotaId: string, board: BoardData): string[] {
  const parents = findParentsOf(anggotaId, board)
  if (!parents.ibuId) return []

  const kandung = findSiblingsKandung(anggotaId, board)

  const siblings: string[] = []
  for (const vert of board.hubunganVertical) {
    if (vert.anakId === anggotaId) continue
    if (kandung.includes(vert.anakId)) continue
    const hub = board.hubunganHorizontal.find(h => h.id === vert.hubunganHorizontalId)
    if (!hub) continue

    if (hub.anggotaBId === parents.ibuId) {
      siblings.push(vert.anakId)
    }
  }

  return siblings
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

export function findGrandfather(
  anggotaId: string,
  board: BoardData
): string | null {
  const father = findFather(anggotaId, board)
  if (!father) return null
  return findFather(father, board)
}

export function findGrandmothers(
  anggotaId: string,
  board: BoardData
): string[] {
  const grandmothers: string[] = []

  const father = findFather(anggotaId, board)
  if (father) {
    const fatherMother = findMother(father, board)
    if (fatherMother) grandmothers.push(fatherMother)
  }

  const mother = findMother(anggotaId, board)
  if (mother) {
    const motherMother = findMother(mother, board)
    if (motherMother) grandmothers.push(motherMother)
  }

  return grandmothers
}

export function findGrandchildrenFromSon(
  anggotaId: string,
  board: BoardData,
  tanggalKematian?: string
): string[] {
  const sons = findSons(anggotaId, board)
  const grandchildren: string[] = []

  for (const sonId of sons) {
    grandchildren.push(...findChildren(sonId, board, tanggalKematian))
  }

  return grandchildren
}

export function findGrandchildrenFromDaughter(
  anggotaId: string,
  board: BoardData,
  tanggalKematian?: string
): string[] {
  const daughters = findDaughters(anggotaId, board)
  const grandchildren: string[] = []

  for (const daughterId of daughters) {
    grandchildren.push(...findChildren(daughterId, board, tanggalKematian))
  }

  return grandchildren
}

export function findPaman(
  anggotaId: string,
  board: BoardData
): string[] {
  const father = findFather(anggotaId, board)
  if (!father) return []
  return findSiblingsKandung(father, board).filter(id => {
    const a = board.anggota.find(x => x.id === id)
    return a?.gender === 'LAKI_LAKI'
  })
}

export function findCucuPengganti(
  anggotaId: string,
  board: BoardData,
  tanggalKematian: string
): { anakId: string; cucuId: string }[] {
  const result: { anakId: string; cucuId: string }[] = []

  const children = board.hubunganVertical
    .filter(v => {
      const hub = board.hubunganHorizontal.find(h => h.id === v.hubunganHorizontalId)
      return hub && (hub.anggotaAId === anggotaId || hub.anggotaBId === anggotaId)
    })
    .filter(v => !v.isAdopted)
    .map(v => v.anakId)

  for (const childId of children) {
    const childAnggota = board.anggota.find(a => a.id === childId)
    if (!childAnggota) continue

    if (childAnggota.tanggalKematian && childAnggota.tanggalKematian < tanggalKematian) {
      const grandchildren = findChildren(childId, board)
      for (const cucuId of grandchildren) {
        result.push({ anakId: childId, cucuId })
      }
    }
  }

  return result
}

export function getRelationship(
  fromId: string,
  toId: string,
  board: BoardData
): string | null {
  if (fromId === toId) return null

  const spouses = findSpouses(fromId, board, new Date().toISOString())
  if (spouses.includes(toId)) return 'Pasangan'

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
