export type Gender = 'LAKI_LAKI' | 'PEREMPUAN'

export type Anggota = {
  id: string
  nama: string
  gender: Gender
  tanggalLahir: string
  tanggalKematian: string | null
}
