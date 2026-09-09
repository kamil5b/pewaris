import { add, greaterThan, ONE } from '../domain/fraction'

type Share = {
  anggotaId: string
  hubungan: string
  bagian: { numerator: bigint; denominator: bigint }
  alasan: string[]
}

export function handleAwl(shares: Share[]): {
  shares: Share[]
  isAwl: boolean
  totalBefore: { numerator: bigint; denominator: bigint }
} {
  let total = { numerator: 0n, denominator: 1n }

  for (const share of shares) {
    total = add(total, share.bagian)
  }

  if (!greaterThan(total, ONE)) {
    return { shares, isAwl: false, totalBefore: total }
  }

  const adjustedShares = shares.map(share => ({
    ...share,
    bagian: {
      numerator: share.bagian.numerator * ONE.denominator,
      denominator: share.bagian.denominator * total.numerator,
    },
    alasan: [...share.alasan, 'Dikurangi karena awl (bagian melebihi harta)'],
  }))

  return { shares: adjustedShares, isAwl: true, totalBefore: total }
}
