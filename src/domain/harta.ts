export type Harta = {
  id: string
  anggotaId: string
  nama: string
  nilaiBeli: number
  nilaiSekarang: number
}

export type PemilikHarta = {
  id: string
  hartaId: string
  anggotaId: string
  persentase: number
}
