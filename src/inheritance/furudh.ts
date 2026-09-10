import type { BoardData } from '../domain/simulation'
import type { EligibleHeir } from './result'
import {
  add,
  QUARTER,
  HALF,
} from '../domain/fraction'
import { findSpouse } from './relationship'

type FurudhShare = {
  anggotaId: string
  bagian: { numerator: bigint; denominator: bigint }
  alasan: string[]
}

export function calculateFurudh(
  eligibleHeirs: EligibleHeir[],
  hasChildren: boolean,
  facts: BoardData,
  pewarisId: string,
  tanggalWarisan: string
): FurudhShare[] {
  const shares: FurudhShare[] = []

  const spouse = findSpouse(pewarisId, facts, tanggalWarisan)
  if (!spouse) return shares

  const spouseHeir = eligibleHeirs.find(h => h.anggotaId === spouse)
  if (!spouseHeir || !spouseHeir.isAlive) return shares

  const share = hasChildren ? QUARTER : HALF
  const alasan = hasChildren
    ? ['Pasangan mendapat 1/4 karena ada anak']
    : ['Pasangan mendapat 1/2 karena tidak ada anak']

  shares.push({
    anggotaId: spouse,
    bagian: share,
    alasan,
  })

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
