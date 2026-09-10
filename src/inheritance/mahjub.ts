import type { BoardData } from '../domain/simulation'
import type { EligibleHeir, MahjubResult } from './result'
import {
  findSpouses,
  findSons,
  findDaughters,
  findFather,
  findMother,
  findGrandchildrenFromSon,
  findSiblingsKandung,
  findSiblingsSeayah,
  findSiblingsSeibu,
  findGrandfather,
  findGrandmothers,
} from './relationship'

function hasAnggota(anggotaId: string, eligibleIds: Set<string>): boolean {
  return eligibleIds.has(anggotaId)
}

function hasAnggotaAny(ids: string[], eligibleIds: Set<string>): boolean {
  return ids.some(id => eligibleIds.has(id))
}

export function determineMahjub(
  eligibleHeirs: EligibleHeir[],
  board: BoardData,
  pewarisId: string,
  tanggalWarisan: string
): MahjubResult[] {
  const results: MahjubResult[] = []
  const eligibleIds = new Set(
    eligibleHeirs.filter(h => h.isAlive).map(h => h.anggotaId)
  )

  const sons = findSons(pewarisId, board, tanggalWarisan)
  const daughters = findDaughters(pewarisId, board, tanggalWarisan)
  const spouses = findSpouses(pewarisId, board, tanggalWarisan)
  const father = findFather(pewarisId, board)
  const mother = findMother(pewarisId, board)
  const siblingsKandung = findSiblingsKandung(pewarisId, board)
  const siblingsSeayah = findSiblingsSeayah(pewarisId, board)
  const siblingsSeibu = findSiblingsSeibu(pewarisId, board)
  const grandfather = findGrandfather(pewarisId, board)
  const grandmothers = findGrandmothers(pewarisId, board)
  const grandsons = findGrandchildrenFromSon(pewarisId, board, tanggalWarisan)
  const granddaughters = findGrandchildrenFromSon(pewarisId, board, tanggalWarisan)
    .filter(id => !grandsons.includes(id))

  const kandungLaki = siblingsKandung.filter(id => {
    const a = board.anggota.find(x => x.id === id)
    return a?.gender === 'LAKI_LAKI'
  })

  const kandungPerempuan = siblingsKandung.filter(id => {
    const a = board.anggota.find(x => x.id === id)
    return a?.gender === 'PEREMPUAN'
  })

  const seayahLaki = siblingsSeayah.filter(id => {
    const a = board.anggota.find(x => x.id === id)
    return a?.gender === 'LAKI_LAKI'
  })

  const seayahPerempuan = siblingsSeayah.filter(id => {
    const a = board.anggota.find(x => x.id === id)
    return a?.gender === 'PEREMPUAN'
  })

  const hasSons = hasAnggotaAny(sons, eligibleIds)

  function addMahjub(anggotaId: string, reason: string, byId: string) {
    const anggota = board.anggota.find(a => a.id === anggotaId)
    const penghalang = board.anggota.find(a => a.id === byId)
    if (!anggota || !penghalang) return

    const existing = results.find(r => r.anggotaId === anggotaId)
    if (existing) {
      existing.alasan.push(reason)
      existing.terhalangOleh.push(byId)
    } else {
      results.push({
        anggotaId,
        hubungan: '',
        alasan: [reason],
        terhalangOleh: [byId],
      })
    }
  }

  for (const id of granddaughters) {
    if (hasSons || hasAnggotaAny(daughters, eligibleIds)) {
      const blocker = hasSons ? sons[0] : daughters[0]
      addMahjub(id, 'Terhalang oleh anak pewaris', blocker)
    }
  }

  for (const id of siblingsKandung) {
    if (hasSons) {
      addMahjub(id, 'Terhalang oleh anak laki-laki', sons[0])
    }
  }

  for (const id of siblingsSeayah) {
    if (hasSons) {
      addMahjub(id, 'Terhalang oleh anak laki-laki', sons[0])
    } else if (hasAnggotaAny(kandungLaki, eligibleIds)) {
      addMahjub(id, 'Terhalang oleh saudara kandung laki-laki', kandungLaki[0])
    } else if (hasAnggotaAny(kandungPerempuan, eligibleIds) && id === seayahPerempuan[0]) {
      addMahjub(id, 'Terhalang oleh saudara kandung perempuan', kandungPerempuan[0])
    }
  }

  for (const id of grandsons) {
    if (hasSons) {
      addMahjub(id, 'Terhalang oleh anak laki-laki', sons[0])
    }
  }

  if (grandfather) {
    if (hasSons) {
      addMahjub(grandfather, 'Terhalang oleh anak laki-laki', sons[0])
    } else if (hasAnggotaAny(daughters, eligibleIds)) {
      addMahjub(grandfather, 'Terhalang oleh anak perempuan', daughters[0])
    } else if (hasAnggotaAny(spouses, eligibleIds)) {
      addMahjub(grandfather, 'Terhalang oleh suami', spouses[0])
    } else if (hasAnggotaAny(kandungLaki, eligibleIds)) {
      addMahjub(grandfather, 'Terhalang oleh saudara kandung laki-laki', kandungLaki[0])
    } else if (hasAnggotaAny(seayahLaki, eligibleIds)) {
      addMahjub(grandfather, 'Terhalang oleh saudara seayah laki-laki', seayahLaki[0])
    }
  }

  for (const gmId of grandmothers) {
    if (hasSons) {
      addMahjub(gmId, 'Terhalang oleh anak laki-laki', sons[0])
    } else if (hasAnggotaAny(daughters, eligibleIds)) {
      addMahjub(gmId, 'Terhalang oleh anak perempuan', daughters[0])
    } else {
      const fatherMother = findMother(father || '', board)
      if (gmId !== fatherMother && hasAnggotaAny([fatherMother].filter(Boolean) as string[], eligibleIds)) {
        addMahjub(gmId, 'Terhalang oleh nenek dari garis ayah', fatherMother!)
      } else if (hasAnggotaAny(spouses, eligibleIds)) {
        addMahjub(gmId, 'Terhalang oleh istri pewaris', spouses[0])
      }
    }
  }

  for (const id of siblingsSeibu) {
    if (hasSons) {
      addMahjub(id, 'Terhalang oleh anak laki-laki', sons[0])
    }
  }

  return results
}

export function filterEligibleHeirs(
  eligibleHeirs: EligibleHeir[],
  mahjubResults: MahjubResult[]
): EligibleHeir[] {
  const mahjubIds = new Set(mahjubResults.map(m => m.anggotaId))
  return eligibleHeirs.filter(h => !mahjubIds.has(h.anggotaId))
}
