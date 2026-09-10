import type { Fraction } from '../domain/fraction'

export type KategoriWaris = 'FURUDH' | 'ASHABAH' | 'PENGGANTI'

export type Candidate = {
  anggotaId: string
  kategori: KategoriWaris
}

export type EligibleHeir = Candidate & {
  isAlive: boolean
}

export type AhliWarisResult = {
  anggotaId: string
  hubungan: string
  kategori: KategoriWaris
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
