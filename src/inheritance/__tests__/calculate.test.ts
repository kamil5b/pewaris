import { describe, test, expect } from 'bun:test'
import { simulateInheritance } from '../calculate'
import type { BoardData, SimulationContext } from '../../domain/simulation'

describe('simulateInheritance', () => {
  test('basic scenario: pewaris + suami + 2 anak', () => {
    const board: BoardData = {
      anggota: [
        { id: 'pewaris-1', nama: 'Siti', gender: 'PEREMPUAN', tanggalLahir: '1985-01-01', tanggalKematian: null },
        { id: 'suami-1', nama: 'Ahmad', gender: 'LAKI_LAKI', tanggalLahir: '1983-01-01', tanggalKematian: null },
        { id: 'anak-1', nama: 'Budi', gender: 'LAKI_LAKI', tanggalLahir: '2012-01-01', tanggalKematian: null },
        { id: 'anak-2', nama: 'Dewi', gender: 'PEREMPUAN', tanggalLahir: '2014-01-01', tanggalKematian: null },
      ],
      hubunganHorizontal: [
        {
          id: 'hub-1',
          anggotaAId: 'suami-1',
          anggotaBId: 'pewaris-1',
          tanggalMulai: '2010-01-01',
          tanggalMulaiSah: '2010-01-01',
          tanggalBerakhir: null,
          tanggalBerakhirSah: null,
          jenisAkhir: null,
        },
      ],
      hubunganVertical: [
        {
          id: 'vert-1',
          anakId: 'anak-1',
          hubunganHorizontalId: 'hub-1',
          isNasabAyah: true,
          isAdopted: false,
        },
        {
          id: 'vert-2',
          anakId: 'anak-2',
          hubunganHorizontalId: 'hub-1',
          isNasabAyah: true,
          isAdopted: false,
        },
      ],
      harta: [
        {
          id: 'harta-1',
          anggotaId: 'pewaris-1',
          nama: 'Rumah',
          nilaiBeli: 500000000,
          nilaiSekarang: 1000000000,
        },
      ],
      pemilikHarta: [
        {
          id: 'pemilik-1',
          hartaId: 'harta-1',
          anggotaId: 'pewaris-1',
          persentase: 100,
        },
      ],
    }

    const context: SimulationContext = {
      pewarisId: 'pewaris-1',
      tanggalWarisan: '2024-01-01',
    }

    const result = simulateInheritance(board, context)

    expect(result.pewarisId).toBe('pewaris-1')
    expect(result.hartaWarisanBersih).toBe(1000000000)
    expect(result.ahliWaris.length).toBeGreaterThan(0)
    expect(result.calculation.length).toBeGreaterThan(0)

    const suami = result.ahliWaris.find(h => h.hubungan === 'Pasangan')
    expect(suami).toBeDefined()
    expect(suami!.bagian.numerator).toBe(1n)
    expect(suami!.bagian.denominator).toBe(4n)

    const anak = result.ahliWaris.filter(h => h.hubungan === 'Anak')
    expect(anak.length).toBe(2)
  })

  test('scenario without children', () => {
    const board: BoardData = {
      anggota: [
        { id: 'pewaris-1', nama: 'Siti', gender: 'PEREMPUAN', tanggalLahir: '1985-01-01', tanggalKematian: null },
        { id: 'suami-1', nama: 'Ahmad', gender: 'LAKI_LAKI', tanggalLahir: '1983-01-01', tanggalKematian: null },
      ],
      hubunganHorizontal: [
        {
          id: 'hub-1',
          anggotaAId: 'suami-1',
          anggotaBId: 'pewaris-1',
          tanggalMulai: '2010-01-01',
          tanggalMulaiSah: '2010-01-01',
          tanggalBerakhir: null,
          tanggalBerakhirSah: null,
          jenisAkhir: null,
        },
      ],
      hubunganVertical: [],
      harta: [
        {
          id: 'harta-1',
          anggotaId: 'pewaris-1',
          nama: 'Rumah',
          nilaiBeli: 500000000,
          nilaiSekarang: 1000000000,
        },
      ],
      pemilikHarta: [
        {
          id: 'pemilik-1',
          hartaId: 'harta-1',
          anggotaId: 'pewaris-1',
          persentase: 100,
        },
      ],
    }

    const context: SimulationContext = {
      pewarisId: 'pewaris-1',
      tanggalWarisan: '2024-01-01',
    }

    const result = simulateInheritance(board, context)

    const suami = result.ahliWaris.find(h => h.hubungan === 'Pasangan')
    expect(suami).toBeDefined()
    expect(suami!.bagian.numerator).toBe(1n)
    expect(suami!.bagian.denominator).toBe(2n)
  })
})
