export type JenisAkhir = 'CERAI_HIDUP' | 'CERAI_MATI'

export type HubunganHorizontal = {
  id: string
  anggotaAId: string
  anggotaBId: string
  tanggalMulai: string
  tanggalMulaiSah: string
  tanggalBerakhir: string | null
  tanggalBerakhirSah: string | null
  jenisAkhir: JenisAkhir | null
}
