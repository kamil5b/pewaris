import type { EligibleHeir, AhliWarisResult } from './result'
import {
  createFraction,
  add,
  multiply,
  toNumber,
  HALF,
  QUARTER,
  SIXTH,
  EIGHTH,
  THIRD,
} from '../domain/fraction'

type FurudhShare = {
  anggotaId: string
  hubungan: string
  bagian: { numerator: bigint; denominator: bigint }
  alasan: string[]
}

export function calculateFurudh(
  eligibleHeirs: EligibleHeir[],
  hasChildren: boolean
): FurudhShare[] {
  const shares: FurudhShare[] = []

  for (const heir of eligibleHeirs) {
    let share: { numerator: bigint; denominator: bigint } | null = null
    let alasan: string[] = []

    switch (heir.hubungan) {
      case 'SUAMI':
        share = hasChildren ? QUARTER : HALF
        alasan = hasChildren
          ? 'Suami mendapat 1/4 karena ada anak'
          : 'Suami mendapat 1/2 karena tidak ada anak'
        break

      case 'ISTRI':
        share = hasChildren ? EIGHTH : QUARTER
        alasan = hasChildren
          ? 'Istri mendapat 1/8 karena ada anak'
          : 'Istri mendapat 1/4 karena tidak ada anak'
        break

      case 'AYAH':
        if (hasChildren) {
          share = SIXTH
          alasan = ['Ayah mendapat 1/6 karena ada anak']
        }
        break

      case 'IBU':
        if (hasChildren) {
          share = SIXTH
          alasan = ['Ibu mendapat 1/6 karena ada anak']
        } else {
          share = THIRD
          alasan = ['Ibu mendapat 1/3 karena tidak ada anak']
        }
        break
    }

    if (share) {
      shares.push({
        anggotaId: heir.anggotaId,
        hubungan: heir.hubungan,
        bagian: share,
        alasan,
      })
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
