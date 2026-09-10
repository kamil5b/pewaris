import { z } from 'zod'

export const genderSchema = z.enum(['LAKI_LAKI', 'PEREMPUAN'])

export const anggotaSchema = z.object({
  id: z.string().uuid(),
  nama: z.string().min(1, 'Nama harus diisi'),
  gender: genderSchema,
  tanggalLahir: z.string().min(1, 'Tanggal lahir harus diisi'),
  tanggalKematian: z.string().nullable(),
})

export const jenisAkhirSchema = z.enum(['CERAI_HIDUP', 'CERAI_MATI'])

export const hubunganHorizontalSchema = z.object({
  id: z.string().uuid(),
  anggotaAId: z.string().uuid(),
  anggotaBId: z.string().uuid(),
  tanggalMulai: z.string().min(1, 'Tanggal mulai harus diisi'),
  tanggalMulaiSah: z.string().min(1, 'Tanggal mulai sah harus diisi'),
  tanggalBerakhir: z.string().nullable(),
  tanggalBerakhirSah: z.string().nullable(),
  jenisAkhir: jenisAkhirSchema.nullable(),
})

export const hubunganVerticalSchema = z.object({
  id: z.string().uuid(),
  anakId: z.string().uuid(),
  hubunganHorizontalId: z.string().uuid(),
  tanggalLahir: z.string().min(1, 'Tanggal lahir harus diisi'),
})

export const hartaSchema = z.object({
  id: z.string().uuid(),
  anggotaId: z.string().uuid(),
  nama: z.string().min(1, 'Nama harta harus diisi'),
  nilaiBeli: z.number().min(0, 'Nilai beli tidak boleh negatif'),
  nilaiSekarang: z.number().min(0, 'Nilai sekarang tidak boleh negatif'),
})

export const pemilikHartaSchema = z.object({
  id: z.string().uuid(),
  hartaId: z.string().uuid(),
  anggotaId: z.string().uuid(),
  persentase: z.number().min(0).max(100, 'Persentase maksimal 100'),
})

export const simulationContextSchema = z.object({
  pewarisId: z.string().uuid(),
  tanggalKematian: z.string().min(1, 'Tanggal kematian harus diisi'),
})

export type AnggotaInput = z.infer<typeof anggotaSchema>
export type HubunganHorizontalInput = z.infer<typeof hubunganHorizontalSchema>
export type HubunganVerticalInput = z.infer<typeof hubunganVerticalSchema>
export type HartaInput = z.infer<typeof hartaSchema>
export type PemilikHartaInput = z.infer<typeof pemilikHartaSchema>
export type SimulationContextInput = z.infer<typeof simulationContextSchema>
