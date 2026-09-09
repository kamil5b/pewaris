import type { Fraction } from '../domain/fraction'

export type RelationshipType =
  | 'SUAMI'
  | 'ISTRI'
  | 'AYAH'
  | 'IBU'
  | 'ANAK_LAKI'
  | 'ANAK_PEREMPUAN'
  | 'SAUDARA_LAKI'
  | 'SAUDARA_PEREMPUAN'
  | 'KAKEK'
  | 'NENEK'
  | 'CUCU_LAKI'
  | 'CUCU_PEREMPUAN'

export type Candidate = {
  anggotaId: string
  hubungan: RelationshipType
}

export type EligibleHeir = Candidate & {
  isAlive: boolean
}

export type AhliWarisResult = {
  anggotaId: string
  hubungan: string
  bagian: Fraction
  nominal: number
  alasan: string[]
}

export type MahjubResult = {
  anggotaId: string
  hubungan: string
  alasan: string[]
  terhalangOleh: string[]
}

export type CalculationStep = {
  langkah: string
  detail: string
}

export type InheritanceResult = {
  pewarisId: string
  hartaWarisanBersih: number
  ahliWaris: AhliWarisResult[]
  mahjub: MahjubResult[]
  calculation: CalculationStep[]
}
