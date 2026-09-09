import type { EligibleHeir } from './result'
import {
  createFraction,
  add,
  subtract,
  ONE,
  toNumber,
} from '../domain/fraction'

type AshabahShare = {
  anggotaId: string
  hubungan: string
  bagian: { numerator: bigint; denominator: bigint }
  alasan: string[]
}

export function calculateAshabah(
  eligibleHeirs: EligibleHeir[],
  furudhTotal: { numerator: bigint; denominator: bigint },
  _totalEstate: number
): AshabahShare[] {
  const remainder = subtract(ONE, furudhTotal)

  if (remainder.numerator <= 0n) {
    return []
  }

  const children = eligibleHeirs.filter(h =>
    h.hubungan === 'ANAK_LAKI' || h.hubungan === 'ANAK_PEREMPUAN'
  )

  if (children.length === 0) {
    return []
  }

  const sons = children.filter(c => c.hubungan === 'ANAK_LAKI')
  const daughters = children.filter(c => c.hubungan === 'ANAK_PEREMPUAN')

  const shares: AshabahShare[] = []

  if (sons.length > 0 && daughters.length > 0) {
    const totalParts = sons.length * 2 + daughters.length
    const partValue = {
      numerator: remainder.numerator * 1n,
      denominator: remainder.denominator * BigInt(totalParts),
    }

    for (const son of sons) {
      const bagian = {
        numerator: partValue.numerator * 2n,
        denominator: partValue.denominator,
      }
      shares.push({
        anggotaId: son.anggotaId,
        hubungan: son.hubungan,
        bagian,
        alasan: [`Anak laki-laki mendapat 2/${totalParts} dari sisa`],
      })
    }

    for (const daughter of daughters) {
      shares.push({
        anggotaId: daughter.anggotaId,
        hubungan: daughter.hubungan,
        bagian: partValue,
        alasan: [`Anak perempuan mendapat 1/${totalParts} dari sisa`],
      })
    }
  } else if (sons.length > 0) {
    const bagian = {
      numerator: remainder.numerator,
      denominator: remainder.denominator * BigInt(sons.length),
    }

    for (const son of sons) {
      shares.push({
        anggotaId: son.anggotaId,
        hubungan: son.hubungan,
        bagian,
        alasan: [`Anak laki-laki mendapat 1/${sons.length} dari sisa`],
      })
    }
  } else {
    const bagian = {
      numerator: remainder.numerator,
      denominator: remainder.denominator * BigInt(daughters.length),
    }

    for (const daughter of daughters) {
      shares.push({
        anggotaId: daughter.anggotaId,
        hubungan: daughter.hubungan,
        bagian,
        alasan: [`Anak perempuan mendapat 1/${daughters.length} dari sisa`],
      })
    }
  }

  return shares
}
