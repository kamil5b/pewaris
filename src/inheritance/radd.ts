import { add, subtract, ONE } from '../domain/fraction'

type FurudhShare = {
  anggotaId: string
  hubungan: string
  bagian: { numerator: bigint; denominator: bigint }
  alasan: string[]
}

export function handleRadd(
  furudhShares: FurudhShare[],
  remainder: { numerator: bigint; denominator: bigint }
): FurudhShare[] {
  if (remainder.numerator <= 0n) {
    return furudhShares
  }

  const raddEligible = furudhShares.filter(
    s => s.hubungan !== 'SUAMI' && s.hubungan !== 'ISTRI'
  )

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
