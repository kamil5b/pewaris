import type { BoardData } from '../domain/simulation'
import type { EligibleHeir, MahjubResult } from './result'
import { findChildren, findParentsOf, findSiblings } from './relationship'

export function determineMahjub(
  eligibleHeirs: EligibleHeir[],
  board: BoardData,
  pewarisId: string
): MahjubResult[] {
  const mahjubResults: MahjubResult[] = []
  const heirs = eligibleHeirs.filter(h => h.isAlive)

  const children = heirs.filter(h =>
    h.hubungan === 'ANAK_LAKI' || h.hubungan === 'ANAK_PEREMPUAN'
  )
  const hasChildren = children.length > 0

  const parents = heirs.filter(h =>
    h.hubungan === 'AYAH' || h.hubungan === 'IBU'
  )
  const siblings = heirs.filter(h =>
    h.hubungan === 'SAUDARA_LAKI' || h.hubungan === 'SAUDARA_PEREMPUAN'
  )

  for (const heir of heirs) {
    const blockedBy: string[] = []
    const reasons: string[] = []

    if (hasChildren) {
      if (heir.hubungan === 'KAKEK' || heir.hubungan === 'NENEK') {
        const parent = parents.find(p =>
          (heir.hubungan === 'KAKEK' && p.hubungan === 'AYAH') ||
          (heir.hubungan === 'NENEK' && p.hubungan === 'IBU')
        )
        if (parent) {
          blockedBy.push(parent.anggotaId)
          reasons.push(`${heir.hubungan} terhalang oleh ${parent.hubungan}`)
        }
      }
    }

    if (heir.hubungan === 'SAUDARA_LAKI' || heir.hubungan === 'SAUDARA_PEREMPUAN') {
      if (hasChildren) {
        blockedBy.push(...children.map(c => c.anggotaId))
        reasons.push('Saudara terhalang oleh anak pewaris')
      }
    }

    if (heir.hubungan === 'CUCU_LAKI' || heir.hubungan === 'CUCU_PEREMPUAN') {
      if (hasChildren) {
        blockedBy.push(...children.map(c => c.anggotaId))
        reasons.push('Cucu terhalang oleh anak pewaris')
      }
    }

    if (blockedBy.length > 0) {
      const anggota = board.anggota.find(a => a.id === heir.anggotaId)
      mahjubResults.push({
        anggotaId: heir.anggotaId,
        hubungan: heir.hubungan,
        alasan: reasons,
        terhalangOleh: blockedBy,
      })
    }
  }

  return mahjubResults
}

export function filterEligibleHeirs(
  eligibleHeirs: EligibleHeir[],
  mahjubResults: MahjubResult[]
): EligibleHeir[] {
  const mahjubIds = new Set(mahjubResults.map(m => m.anggotaId))
  return eligibleHeirs.filter(h => !mahjubIds.has(h.anggotaId))
}
