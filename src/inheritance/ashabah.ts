import type { BoardData } from '../domain/simulation'
import type { EligibleHeir } from './result'
import {
  subtract,
  ONE,
} from '../domain/fraction'
import { findChildren } from './relationship'

type AshabahShare = {
  anggotaId: string
  bagian: { numerator: bigint; denominator: bigint }
  alasan: string[]
}

export function calculateAshabah(
  eligibleHeirs: EligibleHeir[],
  furudhTotal: { numerator: bigint; denominator: bigint },
  _totalEstate: number,
  facts: BoardData,
  pewarisId: string
): AshabahShare[] {
  const remainder = subtract(ONE, furudhTotal)

  if (remainder.numerator <= 0n) {
    return []
  }

  const pewarisChildren = findChildren(pewarisId, facts)
  const children = eligibleHeirs.filter(h => pewarisChildren.includes(h.anggotaId))

  if (children.length === 0) {
    return []
  }

  const sonIds = children.filter(c => {
    const anggota = facts.anggota.find(a => a.id === c.anggotaId)
    return anggota?.gender === 'LAKI_LAKI'
  })
  const daughterIds = children.filter(c => {
    const anggota = facts.anggota.find(a => a.id === c.anggotaId)
    return anggota?.gender === 'PEREMPUAN'
  })

  const shares: AshabahShare[] = []

  if (sonIds.length > 0 && daughterIds.length > 0) {
    const totalParts = sonIds.length * 2 + daughterIds.length
    const partValue = {
      numerator: remainder.numerator * 1n,
      denominator: remainder.denominator * BigInt(totalParts),
    }

    for (const son of sonIds) {
      const bagian = {
        numerator: partValue.numerator * 2n,
        denominator: partValue.denominator,
      }
      shares.push({
        anggotaId: son.anggotaId,
        bagian,
        alasan: [`Anak laki-laki mendapat 2/${totalParts} dari sisa`],
      })
    }

    for (const daughter of daughterIds) {
      shares.push({
        anggotaId: daughter.anggotaId,
        bagian: partValue,
        alasan: [`Anak perempuan mendapat 1/${totalParts} dari sisa`],
      })
    }
  } else if (sonIds.length > 0) {
    const bagian = {
      numerator: remainder.numerator,
      denominator: remainder.denominator * BigInt(sonIds.length),
    }

    for (const son of sonIds) {
      shares.push({
        anggotaId: son.anggotaId,
        bagian,
        alasan: [`Anak laki-laki mendapat 1/${sonIds.length} dari sisa`],
      })
    }
  } else {
    const bagian = {
      numerator: remainder.numerator,
      denominator: remainder.denominator * BigInt(daughterIds.length),
    }

    for (const daughter of daughterIds) {
      shares.push({
        anggotaId: daughter.anggotaId,
        bagian,
        alasan: [`Anak perempuan mendapat 1/${daughterIds.length} dari sisa`],
      })
    }
  }

  return shares
}
