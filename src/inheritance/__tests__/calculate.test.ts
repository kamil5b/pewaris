import { describe, test, expect } from 'bun:test'
import { simulateInheritance } from '../calculate'
import type { BoardData, SimulationContext } from '../../domain/simulation'

function makeBase(overrides?: Partial<BoardData>): BoardData {
  const base: BoardData = {
    anggota: [],
    hubunganHorizontal: [],
    hubunganVertical: [],
    harta: [],
    pemilikHarta: [],
    ...overrides,
  }
  return base
}

function makeHarta(pewarisId: string, nilai: number): BoardData {
  return makeBase({
    harta: [{ id: 'harta-1', anggotaId: pewarisId, nama: 'Tirkah', nilaiBeli: nilai, nilaiSekarang: nilai }],
    pemilikHarta: [{ id: 'pemilik-1', hartaId: 'harta-1', anggotaId: pewarisId, persentase: 100 }],
  })
}

function merge(...boards: BoardData[]): BoardData {
  const result = makeBase()
  for (const b of boards) {
    result.anggota.push(...b.anggota)
    result.hubunganHorizontal.push(...b.hubunganHorizontal)
    result.hubunganVertical.push(...b.hubunganVertical)
    result.harta.push(...b.harta)
    result.pemilikHarta.push(...b.pemilikHarta)
  }
  return result
}

describe('simulateInheritance', () => {
  test('basic scenario: pewaris + suami + 2 anak (1 laki, 1 perempuan)', () => {
    const board = merge(
      makeBase({
        anggota: [
          { id: 'pewaris-1', nama: 'Siti', gender: 'PEREMPUAN', tanggalLahir: '1985-01-01', tanggalKematian: null },
          { id: 'suami-1', nama: 'Ahmad', gender: 'LAKI_LAKI', tanggalLahir: '1983-01-01', tanggalKematian: null },
          { id: 'anak-1', nama: 'Budi', gender: 'LAKI_LAKI', tanggalLahir: '2012-01-01', tanggalKematian: null },
          { id: 'anak-2', nama: 'Dewi', gender: 'PEREMPUAN', tanggalLahir: '2014-01-01', tanggalKematian: null },
        ],
        hubunganHorizontal: [{
          id: 'hub-1', anggotaAId: 'suami-1', anggotaBId: 'pewaris-1',
          tanggalMulai: '2010-01-01', tanggalMulaiSah: '2010-01-01',
          tanggalBerakhir: null, tanggalBerakhirSah: null, jenisAkhir: null,
        }],
        hubunganVertical: [
          { id: 'vert-1', anakId: 'anak-1', hubunganHorizontalId: 'hub-1', isNasabAyah: true, isAdopted: false },
          { id: 'vert-2', anakId: 'anak-2', hubunganHorizontalId: 'hub-1', isNasabAyah: true, isAdopted: false },
        ],
      }),
      makeHarta('pewaris-1', 1_000_000_000)
    )

    const result = simulateInheritance(board, { pewarisId: 'pewaris-1', tanggalWarisan: '2024-01-01' })

    expect(result.pewarisId).toBe('pewaris-1')
    expect(result.hartaWarisanBersih).toBe(1_000_000_000)

    const suami = result.ahliWaris.find(h => h.hubungan === 'Suami')
    expect(suami).toBeDefined()
    expect(suami!.bagian.numerator).toBe(1n)
    expect(suami!.bagian.denominator).toBe(4n)

    const anak = result.ahliWaris.filter(h => h.hubungan.startsWith('Anak'))
    expect(anak.length).toBe(2)
  })

  test('scenario without children: suami gets 1/2', () => {
    const board = merge(
      makeBase({
        anggota: [
          { id: 'pewaris-1', nama: 'Siti', gender: 'PEREMPUAN', tanggalLahir: '1985-01-01', tanggalKematian: null },
          { id: 'suami-1', nama: 'Ahmad', gender: 'LAKI_LAKI', tanggalLahir: '1983-01-01', tanggalKematian: null },
        ],
        hubunganHorizontal: [{
          id: 'hub-1', anggotaAId: 'suami-1', anggotaBId: 'pewaris-1',
          tanggalMulai: '2010-01-01', tanggalMulaiSah: '2010-01-01',
          tanggalBerakhir: null, tanggalBerakhirSah: null, jenisAkhir: null,
        }],
        hubunganVertical: [],
      }),
      makeHarta('pewaris-1', 1_000_000_000)
    )

    const result = simulateInheritance(board, { pewarisId: 'pewaris-1', tanggalWarisan: '2024-01-01' })

    const suami = result.ahliWaris.find(h => h.hubungan === 'Suami')
    expect(suami).toBeDefined()
    expect(suami!.bagian.numerator).toBe(1n)
    expect(suami!.bagian.denominator).toBe(2n)
  })

  test('pewaris with ayah and ibu only (no children, no spouse) - radd applies', () => {
    const board = merge(
      makeBase({
        anggota: [
          { id: 'pewaris-1', nama: 'Siti', gender: 'PEREMPUAN', tanggalLahir: '1985-01-01', tanggalKematian: null },
          { id: 'ayah-1', nama: 'Bapak', gender: 'LAKI_LAKI', tanggalLahir: '1960-01-01', tanggalKematian: null },
          { id: 'ibu-1', nama: 'Ibu', gender: 'PEREMPUAN', tanggalLahir: '1962-01-01', tanggalKematian: null },
        ],
        hubunganHorizontal: [{
          id: 'hub-ortu', anggotaAId: 'ayah-1', anggotaBId: 'ibu-1',
          tanggalMulai: '1984-01-01', tanggalMulaiSah: '1984-01-01',
          tanggalBerakhir: null, tanggalBerakhirSah: null, jenisAkhir: null,
        }],
        hubunganVertical: [
          { id: 'vert-1', anakId: 'pewaris-1', hubunganHorizontalId: 'hub-ortu', isNasabAyah: true, isAdopted: false },
        ],
      }),
      makeHarta('pewaris-1', 600_000)
    )

    const result = simulateInheritance(board, { pewarisId: 'pewaris-1', tanggalWarisan: '2024-01-01' })

    const ayah = result.ahliWaris.find(h => h.hubungan === 'Ayah')
    const ibu = result.ahliWaris.find(h => h.hubungan === 'Ibu')
    expect(ayah).toBeDefined()
    expect(ibu).toBeDefined()
    expect(ayah!.bagian.numerator).toBe(1n)
    expect(ayah!.bagian.denominator).toBe(2n)
    expect(ibu!.bagian.numerator).toBe(1n)
    expect(ibu!.bagian.denominator).toBe(2n)
  })

  test('pewaris with only ayah (no ibu, no spouse, no children)', () => {
    const board = merge(
      makeBase({
        anggota: [
          { id: 'pewaris-1', nama: 'Siti', gender: 'PEREMPUAN', tanggalLahir: '1985-01-01', tanggalKematian: null },
          { id: 'ayah-1', nama: 'Bapak', gender: 'LAKI_LAKI', tanggalLahir: '1960-01-01', tanggalKematian: null },
          { id: 'ibu-1', nama: 'Ibu', gender: 'PEREMPUAN', tanggalLahir: '1962-01-01', tanggalKematian: '2020-01-01' },
        ],
        hubunganHorizontal: [{
          id: 'hub-ortu', anggotaAId: 'ayah-1', anggotaBId: 'ibu-1',
          tanggalMulai: '1984-01-01', tanggalMulaiSah: '1984-01-01',
          tanggalBerakhir: '2020-01-01', tanggalBerakhirSah: '2020-01-01', jenisAkhir: 'CERAI_MATI',
        }],
        hubunganVertical: [
          { id: 'vert-1', anakId: 'pewaris-1', hubunganHorizontalId: 'hub-ortu', isNasabAyah: true, isAdopted: false },
        ],
      }),
      makeHarta('pewaris-1', 600_000)
    )

    const result = simulateInheritance(board, { pewarisId: 'pewaris-1', tanggalWarisan: '2024-01-01' })

    const ayah = result.ahliWaris.find(h => h.hubungan === 'Ayah')
    expect(ayah).toBeDefined()
    expect(ayah!.bagian.numerator).toBe(1n)
    expect(ayah!.bagian.denominator).toBe(1n)
  })

  test('pewaris with 2 daughters and deceased wife - each daughter gets 2/3 furudh', () => {
    const board = merge(
      makeBase({
        anggota: [
          { id: 'pewaris-1', nama: 'Ayah', gender: 'LAKI_LAKI', tanggalLahir: '1980-01-01', tanggalKematian: null },
          { id: 'istri-1', nama: 'Ibu', gender: 'PEREMPUAN', tanggalLahir: '1982-01-01', tanggalKematian: '2020-01-01' },
          { id: 'anak-1', nama: 'Dewi', gender: 'PEREMPUAN', tanggalLahir: '2005-01-01', tanggalKematian: null },
          { id: 'anak-2', nama: 'Rina', gender: 'PEREMPUAN', tanggalLahir: '2007-01-01', tanggalKematian: null },
        ],
        hubunganHorizontal: [{
          id: 'hub-1', anggotaAId: 'pewaris-1', anggotaBId: 'istri-1',
          tanggalMulai: '2004-01-01', tanggalMulaiSah: '2004-01-01',
          tanggalBerakhir: '2020-01-01', tanggalBerakhirSah: '2020-01-01', jenisAkhir: 'CERAI_MATI',
        }],
        hubunganVertical: [
          { id: 'vert-1', anakId: 'anak-1', hubunganHorizontalId: 'hub-1', isNasabAyah: true, isAdopted: false },
          { id: 'vert-2', anakId: 'anak-2', hubunganHorizontalId: 'hub-1', isNasabAyah: true, isAdopted: false },
        ],
      }),
      makeHarta('pewaris-1', 900_000)
    )

    const result = simulateInheritance(board, { pewarisId: 'pewaris-1', tanggalWarisan: '2024-01-01' })

    const daughters = result.ahliWaris.filter(h => h.hubungan.startsWith('Anak'))
    expect(daughters.length).toBe(2)

    for (const d of daughters) {
      expect(d.bagian.numerator).toBe(1n)
      expect(d.bagian.denominator).toBe(2n)
    }
  })

  test('deceased child replaced by grandchild (Pasal 185)', () => {
    const board = merge(
      makeBase({
        anggota: [
          { id: 'pewaris-1', nama: 'Siti', gender: 'PEREMPUAN', tanggalLahir: '1985-01-01', tanggalKematian: null },
          { id: 'suami-1', nama: 'Ahmad', gender: 'LAKI_LAKI', tanggalLahir: '1983-01-01', tanggalKematian: null },
          { id: 'anak-1', nama: 'Budi', gender: 'LAKI_LAKI', tanggalLahir: '2010-01-01', tanggalKematian: '2020-01-01' },
          { id: 'istri-anak1', nama: 'Rina', gender: 'PEREMPUAN', tanggalLahir: '2012-01-01', tanggalKematian: null },
          { id: 'cucu-1', nama: 'Andi', gender: 'LAKI_LAKI', tanggalLahir: '2015-01-01', tanggalKematian: null },
        ],
        hubunganHorizontal: [
          {
            id: 'hub-1', anggotaAId: 'suami-1', anggotaBId: 'pewaris-1',
            tanggalMulai: '2009-01-01', tanggalMulaiSah: '2009-01-01',
            tanggalBerakhir: null, tanggalBerakhirSah: null, jenisAkhir: null,
          },
          {
            id: 'hub-anak1', anggotaAId: 'anak-1', anggotaBId: 'istri-anak1',
            tanggalMulai: '2014-01-01', tanggalMulaiSah: '2014-01-01',
            tanggalBerakhir: null, tanggalBerakhirSah: null, jenisAkhir: null,
          },
        ],
        hubunganVertical: [
          { id: 'vert-1', anakId: 'anak-1', hubunganHorizontalId: 'hub-1', isNasabAyah: true, isAdopted: false },
          { id: 'vert-cucu', anakId: 'cucu-1', hubunganHorizontalId: 'hub-anak1', isNasabAyah: true, isAdopted: false },
        ],
      }),
      makeHarta('pewaris-1', 1_000_000_000)
    )

    const result = simulateInheritance(board, { pewarisId: 'pewaris-1', tanggalWarisan: '2024-01-01' })

    const cucu = result.ahliWaris.find(h => h.anggotaId === 'cucu-1')
    expect(cucu).toBeDefined()
    expect(cucu!.hubungan).toBe('Cucu Laki-laki (Pengganti)')
    expect(cucu!.kategori).toBe('PENGGANTI')

    const suami = result.ahliWaris.find(h => h.anggotaId === 'suami-1')
    expect(suami).toBeDefined()
    expect(suami!.hubungan).toBe('Suami')
    expect(suami!.kategori).toBe('FURUDH')
  })

  test('adopted child is NOT an heir', () => {
    const board = merge(
      makeBase({
        anggota: [
          { id: 'pewaris-1', nama: 'Siti', gender: 'PEREMPUAN', tanggalLahir: '1985-01-01', tanggalKematian: null },
          { id: 'suami-1', nama: 'Ahmad', gender: 'LAKI_LAKI', tanggalLahir: '1983-01-01', tanggalKematian: null },
          { id: 'anak-1', nama: 'Adopted', gender: 'LAKI_LAKI', tanggalLahir: '2010-01-01', tanggalKematian: null },
        ],
        hubunganHorizontal: [{
          id: 'hub-1', anggotaAId: 'suami-1', anggotaBId: 'pewaris-1',
          tanggalMulai: '2009-01-01', tanggalMulaiSah: '2009-01-01',
          tanggalBerakhir: null, tanggalBerakhirSah: null, jenisAkhir: null,
        }],
        hubunganVertical: [
          { id: 'vert-1', anakId: 'anak-1', hubunganHorizontalId: 'hub-1', isNasabAyah: true, isAdopted: true },
        ],
      }),
      makeHarta('pewaris-1', 1_000_000_000)
    )

    const result = simulateInheritance(board, { pewarisId: 'pewaris-1', tanggalWarisan: '2024-01-01' })

    const adopted = result.ahliWaris.find(h => h.anggotaId === 'anak-1')
    expect(adopted).toBeUndefined()
  })

  test('poligami: 2 wives split 1/8 each when children exist', () => {
    const board = merge(
      makeBase({
        anggota: [
          { id: 'pewaris-1', nama: 'Pak Budi', gender: 'LAKI_LAKI', tanggalLahir: '1980-01-01', tanggalKematian: null },
          { id: 'istri-1', nama: 'Siti', gender: 'PEREMPUAN', tanggalLahir: '1982-01-01', tanggalKematian: null },
          { id: 'istri-2', nama: 'Aminah', gender: 'PEREMPUAN', tanggalLahir: '1984-01-01', tanggalKematian: null },
          { id: 'anak-1', nama: 'Budi Jr', gender: 'LAKI_LAKI', tanggalLahir: '2010-01-01', tanggalKematian: null },
        ],
        hubunganHorizontal: [
          {
            id: 'hub-1', anggotaAId: 'pewaris-1', anggotaBId: 'istri-1',
            tanggalMulai: '2008-01-01', tanggalMulaiSah: '2008-01-01',
            tanggalBerakhir: null, tanggalBerakhirSah: null, jenisAkhir: null,
          },
          {
            id: 'hub-2', anggotaAId: 'pewaris-1', anggotaBId: 'istri-2',
            tanggalMulai: '2009-01-01', tanggalMulaiSah: '2009-01-01',
            tanggalBerakhir: null, tanggalBerakhirSah: null, jenisAkhir: null,
          },
        ],
        hubunganVertical: [
          { id: 'vert-1', anakId: 'anak-1', hubunganHorizontalId: 'hub-1', isNasabAyah: true, isAdopted: false },
        ],
      }),
      makeHarta('pewaris-1', 800_000)
    )

    const result = simulateInheritance(board, { pewarisId: 'pewaris-1', tanggalWarisan: '2024-01-01' })

    const wives = result.ahliWaris.filter(h => h.hubungan === 'Istri')
    expect(wives.length).toBe(2)

    for (const w of wives) {
      expect(w.bagian.numerator).toBe(1n)
      expect(w.bagian.denominator).toBe(8n)
    }
  })

  test('married but no tanggalMulaiSah - spouse is NOT an heir', () => {
    const board = merge(
      makeBase({
        anggota: [
          { id: 'pewaris-1', nama: 'Siti', gender: 'PEREMPUAN', tanggalLahir: '1985-01-01', tanggalKematian: null },
          { id: 'suami-1', nama: 'Ahmad', gender: 'LAKI_LAKI', tanggalLahir: '1983-01-01', tanggalKematian: null },
        ],
        hubunganHorizontal: [{
          id: 'hub-1', anggotaAId: 'suami-1', anggotaBId: 'pewaris-1',
          tanggalMulai: '2010-01-01', tanggalMulaiSah: null,
          tanggalBerakhir: null, tanggalBerakhirSah: null, jenisAkhir: null,
        }],
        hubunganVertical: [],
      }),
      makeHarta('pewaris-1', 1_000_000_000)
    )

    const result = simulateInheritance(board, { pewarisId: 'pewaris-1', tanggalWarisan: '2024-01-01' })

    const suami = result.ahliWaris.find(h => h.anggotaId === 'suami-1')
    expect(suami).toBeUndefined()
  })
})
