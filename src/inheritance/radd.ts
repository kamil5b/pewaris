import { add, ONE } from '../domain/fraction'
import type { BoardData } from '../domain/simulation'
import { findSpouse } from './relationship'

type Share = {
  anggotaId: string
  bagian: { numerator: bigint; denominator: bigint }
  alasan: string[]
}

export function handleRadd(
  furudhShares: Share[],
  remainder: { numerator: bigint; denominator: bigint },
  facts: BoardData,
  pewarisId: string,
  tanggalWarisan: string
): Share[] {
  if (remainder.numerator <= 0n) {
    return furudhShares
  }

  const spouse = findSpouse(pewarisId, facts, tanggalWarisan)
  const raddEligible = furudhShares.filter(s => s.anggotaId !== spouse)

  if (raddEligible.length === 0) {
    return furudhShares
  }

  let totalEligibleFurudh = { numerator: 0n, denominator: 1n }
  for (const share of raddEligible) {
    totalEligibleFurudh = add(totalEligibleFurudh, share.bagian)
  }

  if (totalEligibleFurudh.numerator === 0n) {
    return furudhShares
  }

  const raddMap = new Map<string, { numerator: bigint; denominator: bigint }>()

  for (const share of raddEligible) {
    const portion = {
      numerator: share.bagian.numerator * totalEligibleFurudh.denominator,
      denominator: share.bagian.denominator * totalEligibleFurudh.numerator,
    }

    const additional = {
      numerator: remainder.numerator * portion.numerator,
      denominator: remainder.denominator * portion.denominator,
    }

    raddMap.set(share.anggotaId, additional)
  }

  return furudhShares.map(share => {
    const additional = raddMap.get(share.anggotaId)
    if (!additional) {
      return share
    }

    return {
      ...share,
      bagian: add(share.bagian, additional),
      alasan: [...share.alasan, 'Mendapat radd (pengembalian sisa)'],
    }
  })
}
