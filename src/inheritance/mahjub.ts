import type { BoardData } from '../domain/simulation'
import type { EligibleHeir, MahjubResult } from './result'

export function determineMahjub(
  eligibleHeirs: EligibleHeir[],
  board: BoardData,
  pewarisId: string
): MahjubResult[] {
  return []
}

export function filterEligibleHeirs(
  eligibleHeirs: EligibleHeir[],
  mahjubResults: MahjubResult[]
): EligibleHeir[] {
  return eligibleHeirs
}
