import type { BoardData } from '../domain/simulation'
import type { EligibleHeir } from './result'
import {
  add,
  QUARTER,
  HALF,
  ONE_THIRD,
  ONE_SIXTH,
  TWO_THIRDS,
} from '../domain/fraction'
import type { Fraction } from '../domain/fraction'
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

export type FurudhShare = {
  anggotaId: string
  bagian: Fraction
  alasan: string[]
}

function hasAnyAmong(ids: string[], eligibleIds: Set<string>): boolean {
  return ids.some(id => eligibleIds.has(id))
}

export function calculateFurudh(
  eligibleHeirs: EligibleHeir[],
  facts: BoardData,
  pewarisId: string,
  tanggalWarisan: string
): FurudhShare[] {
  const shares: FurudhShare[] = []
  const eligibleIds = new Set(eligibleHeirs.filter(h => h.isAlive).map(h => h.anggotaId))

  const spouses = findSpouses(pewarisId, facts, tanggalWarisan)
  const sons = findSons(pewarisId, facts, tanggalWarisan)
  const daughters = findDaughters(pewarisId, facts, tanggalWarisan)
  const grandsons = findGrandchildrenFromSon(pewarisId, facts, tanggalWarisan)
  const granddaughters = findGrandchildrenFromSon(pewarisId, facts, tanggalWarisan)
    .filter(id => !grandsons.includes(id))
  const father = findFather(pewarisId, facts)
  const mother = findMother(pewarisId, facts)
  const grandfather = findGrandfather(pewarisId, facts)
  const grandmothers = findGrandmothers(pewarisId, facts)
  const siblingsKandung = findSiblingsKandung(pewarisId, facts)
  const siblingsSeayah = findSiblingsSeayah(pewarisId, facts)
  const siblingsSeibu = findSiblingsSeibu(pewarisId, facts)

  const hasAnakLangsung = hasAnyAmong([...sons, ...daughters], eligibleIds)
  const hasSons = hasAnyAmong(sons, eligibleIds)
  const hasAnakAtauPengganti = hasAnakLangsung || hasAnyAmong(grandsons, eligibleIds)

  const kandungPerempuan = siblingsKandung.filter(id => {
    const a = facts.anggota.find(x => x.id === id)
    return a?.gender === 'PEREMPUAN' && eligibleIds.has(id)
  })

  const seayahPerempuan = siblingsSeayah.filter(id => {
    const a = facts.anggota.find(x => x.id === id)
    return a?.gender === 'PEREMPUAN' && eligibleIds.has(id)
  })

  for (const spouseId of spouses) {
    if (!eligibleIds.has(spouseId)) continue
    const totalSpouseCount = spouses.filter(id => eligibleIds.has(id)).length
    const baseShare = hasAnakAtauPengganti ? QUARTER : HALF
    const share: Fraction = {
      numerator: baseShare.numerator,
      denominator: baseShare.denominator * BigInt(totalSpouseCount),
    }
    const alasan = hasAnakAtauPengganti
      ? [`Suami/Istri mendapat 1/${4 * totalSpouseCount} (1/4 dibagi ${totalSpouseCount} istri)`]
      : [`Suami/Istri mendapat 1/${2 * totalSpouseCount} (1/2 dibagi ${totalSpouseCount} istri)`]
    shares.push({ anggotaId: spouseId, bagian: share, alasan })
  }

  if (father && eligibleIds.has(father)) {
    if (hasAnakLangsung) {
      shares.push({ anggotaId: father, bagian: ONE_SIXTH, alasan: ['Ayah mendapat 1/6 karena ada anak'] })
    } else {
      shares.push({ anggotaId: father, bagian: { numerator: 1n, denominator: 3n }, alasan: ['Ayah mendapat 1/3 karena tidak ada anak'] })
    }
  }

  if (mother && eligibleIds.has(mother)) {
    if (hasAnakLangsung) {
      const sonDaughterCount = sons.length + daughters.length
      if (sonDaughterCount >= 2) {
        shares.push({ anggotaId: mother, bagian: ONE_SIXTH, alasan: ['Ibu mendapat 1/6 karena ada 2+ anak'] })
      } else {
        shares.push({ anggotaId: mother, bagian: ONE_SIXTH, alasan: ['Ibu mendapat 1/6 karena hanya 1 anak'] })
      }
    } else {
      shares.push({ anggotaId: mother, bagian: { numerator: 1n, denominator: 3n }, alasan: ['Ibu mendapat 1/3 karena tidak ada anak'] })
    }
  }

  if (!hasSons) {
    const eligibleDaughters = daughters.filter(id => eligibleIds.has(id))
    if (eligibleDaughters.length === 1) {
      shares.push({ anggotaId: eligibleDaughters[0], bagian: HALF, alasan: ['Anak perempuan mendapat 1/2 (1 orang, tanpa anak laki-laki)'] })
    } else if (eligibleDaughters.length >= 2) {
      for (const dId of eligibleDaughters) {
        shares.push({ anggotaId: dId, bagian: TWO_THIRDS, alasan: [`Anak perempuan mendapat 2/3 total (${eligibleDaughters.length} orang, tanpa anak laki-laki)`] })
      }
    }

    const eligibleGranddaughters = granddaughters.filter(id => eligibleIds.has(id))
    const eligibleGrandsons = grandsons.filter(id => eligibleIds.has(id))
    if (eligibleGranddaughters.length > 0 && eligibleGrandsons.length === 0) {
      if (eligibleGranddaughters.length === 1 && eligibleDaughters.length > 0) {
        shares.push({ anggotaId: eligibleGranddaughters[0], bagian: ONE_SIXTH, alasan: ['Cucu perempuan mendapat 1/6'] })
      } else if (eligibleGranddaughters.length >= 2) {
        for (const gdId of eligibleGranddaughters) {
          shares.push({ anggotaId: gdId, bagian: { numerator: 1n, denominator: 3n }, alasan: ['Cucu perempuan mendapat 1/3 total'] })
        }
      }
    }

    if (eligibleDaughters.length === 0) {
      if (kandungPerempuan.length === 1) {
        shares.push({ anggotaId: kandungPerempuan[0], bagian: HALF, alasan: ['Saudara kandung perempuan mendapat 1/2'] })
      } else if (kandungPerempuan.length >= 2) {
        for (const skpId of kandungPerempuan) {
          shares.push({ anggotaId: skpId, bagian: TWO_THIRDS, alasan: ['Saudara kandung perempuan mendapat 2/3 total'] })
        }
      }

      if (kandungPerempuan.length === 0) {
        if (seayahPerempuan.length === 1) {
          shares.push({ anggotaId: seayahPerempuan[0], bagian: HALF, alasan: ['Saudara seayah perempuan mendapat 1/2'] })
        } else if (seayahPerempuan.length >= 2) {
          for (const spId of seayahPerempuan) {
            shares.push({ anggotaId: spId, bagian: TWO_THIRDS, alasan: ['Saudara seayah perempuan mendapat 2/3 total'] })
          }
        }
      }
    }

    const eligibleSeibu = siblingsSeibu.filter(id => eligibleIds.has(id))
    if (eligibleSeibu.length === 1) {
      shares.push({ anggotaId: eligibleSeibu[0], bagian: ONE_SIXTH, alasan: ['Saudara seibu mendapat 1/6 (1 orang)'] })
    } else if (eligibleSeibu.length >= 2) {
      for (const siId of eligibleSeibu) {
        shares.push({ anggotaId: siId, bagian: { numerator: 1n, denominator: 3n }, alasan: ['Saudara seibu mendapat 1/3 total'] })
      }
    }
  }

  if (grandfather && eligibleIds.has(grandfather)) {
    shares.push({ anggotaId: grandfather, bagian: ONE_SIXTH, alasan: ['Kakek mendapat 1/6'] })
  }

  const eligibleGrandmothers = grandmothers.filter(id => eligibleIds.has(id))
  for (const gmId of eligibleGrandmothers) {
    const fatherMother = mother ? findMother(father || '', facts) : null
    const isPaternal = gmId === fatherMother

    if (isPaternal) {
      if (hasAnakLangsung) {
        shares.push({ anggotaId: gmId, bagian: ONE_SIXTH, alasan: ['Nenek (garis ayah) mendapat 1/6'] })
      } else {
        shares.push({ anggotaId: gmId, bagian: { numerator: 1n, denominator: 3n }, alasan: ['Nenek (garis ayah) mendapat 1/3'] })
      }
    } else {
      shares.push({ anggotaId: gmId, bagian: ONE_SIXTH, alasan: ['Nenek (garis ibu) mendapat 1/6'] })
    }
  }

  return shares
}

export function calculateTotalFurudh(
  shares: FurudhShare[]
): { numerator: bigint; denominator: bigint } {
  let total = { numerator: 0n, denominator: 1n }

  for (const share of shares) {
    total = add(total, share.bagian)
  }

  return total
}
