import type { BoardData } from '../domain/simulation'
import type { EligibleHeir } from './result'
import {
  subtract,
  ONE,
} from '../domain/fraction'
import type { Fraction } from '../domain/fraction'
import {
  findSons,
  findDaughters,
  findGrandchildrenFromSon,
  findSiblingsKandung,
  findSiblingsSeayah,
  findPaman,
} from './relationship'

export type AshabahShare = {
  anggotaId: string
  bagian: Fraction
  alasan: string[]
}

type AshabahPriority = {
  anggotaIds: string[]
  level: string
}

function getAshabahPriority(
  pewarisId: string,
  facts: BoardData,
  tanggalWarisan: string,
  eligibleIds: Set<string>
): AshabahPriority[] {
  const priorities: AshabahPriority[] = []

  const sons = findSons(pewarisId, facts, tanggalWarisan)
    .filter(id => eligibleIds.has(id))
  const daughters = findDaughters(pewarisId, facts, tanggalWarisan)
    .filter(id => eligibleIds.has(id))

  if (sons.length > 0) {
    const allChildren = [...sons, ...daughters]
    priorities.push({ anggotaIds: allChildren, level: 'Anak' })
    return priorities
  }

  const grandsons = findGrandchildrenFromSon(pewarisId, facts, tanggalWarisan)
    .filter(id => eligibleIds.has(id))
  if (grandsons.length > 0) {
    priorities.push({ anggotaIds: grandsons, level: 'Cucu laki-laki (pengganti)' })
    return priorities
  }

  const siblingsKandungLaki = findSiblingsKandung(pewarisId, facts)
    .filter(id => {
      const a = facts.anggota.find(x => x.id === id)
      return a?.gender === 'LAKI_LAKI' && eligibleIds.has(id)
    })
  if (siblingsKandungLaki.length > 0) {
    priorities.push({ anggotaIds: siblingsKandungLaki, level: 'Saudara kandung laki-laki' })
    return priorities
  }

  const siblingsSeayahLaki = findSiblingsSeayah(pewarisId, facts)
    .filter(id => {
      const a = facts.anggota.find(x => x.id === id)
      return a?.gender === 'LAKI_LAKI' && eligibleIds.has(id)
    })
  if (siblingsSeayahLaki.length > 0) {
    priorities.push({ anggotaIds: siblingsSeayahLaki, level: 'Saudara seayah laki-laki' })
    return priorities
  }

  const paman = findPaman(pewarisId, facts)
    .filter(id => eligibleIds.has(id))
  if (paman.length > 0) {
    priorities.push({ anggotaIds: paman, level: 'Paman' })
  }

  return priorities
}

export function calculateAshabah(
  eligibleHeirs: EligibleHeir[],
  furudhTotal: { numerator: bigint; denominator: bigint },
  _totalEstate: number,
  facts: BoardData,
  pewarisId: string,
  tanggalWarisan: string
): AshabahShare[] {
  const remainder = subtract(ONE, furudhTotal)

  if (remainder.numerator <= 0n) {
    return []
  }

  const eligibleIds = new Set(eligibleHeirs.filter(h => h.isAlive).map(h => h.anggotaId))
  const priorities = getAshabahPriority(pewarisId, facts, tanggalWarisan, eligibleIds)

  if (priorities.length === 0) {
    return []
  }

  const firstPriority = priorities[0]
  const shares: AshabahShare[] = []

  if (firstPriority.anggotaIds.length === 1) {
    shares.push({
      anggotaId: firstPriority.anggotaIds[0],
      bagian: remainder,
      alasan: [`${firstPriority.level} mendapat seluruh sisa`],
    })
  } else {
    const eligibleSonCount = firstPriority.anggotaIds.filter(id => {
      const a = facts.anggota.find(x => x.id === id)
      return a?.gender === 'LAKI_LAKI'
    }).length
    const eligibleDaughterCount = firstPriority.anggotaIds.filter(id => {
      const a = facts.anggota.find(x => x.id === id)
      return a?.gender === 'PEREMPUAN'
    }).length

    if (eligibleSonCount > 0 && eligibleDaughterCount > 0) {
      const totalParts = eligibleSonCount * 2 + eligibleDaughterCount
      const partValue: Fraction = {
        numerator: remainder.numerator,
        denominator: remainder.denominator * BigInt(totalParts),
      }

      for (const id of firstPriority.anggotaIds) {
        const a = facts.anggota.find(x => x.id === id)
        if (a?.gender === 'LAKI_LAKI') {
          shares.push({
            anggotaId: id,
            bagian: {
              numerator: partValue.numerator * 2n,
              denominator: partValue.denominator,
            },
            alasan: [`Anak laki-laki mendapat 2/${totalParts} dari sisa`],
          })
        } else {
          shares.push({
            anggotaId: id,
            bagian: partValue,
            alasan: [`Anak perempuan mendapat 1/${totalParts} dari sisa`],
          })
        }
      }
    } else {
      const share: Fraction = {
        numerator: remainder.numerator,
        denominator: remainder.denominator * BigInt(firstPriority.anggotaIds.length),
      }

      for (const id of firstPriority.anggotaIds) {
        shares.push({
          anggotaId: id,
          bagian: share,
          alasan: [`${firstPriority.level} mendapat 1/${firstPriority.anggotaIds.length} dari sisa`],
        })
      }
    }
  }

  return shares
}
