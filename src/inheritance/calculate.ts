import type { BoardData, SimulationContext } from '../domain/simulation'
import type {
  InheritanceResult,
  AhliWarisResult,
  CalculationStep,
} from './result'
import { resolveCandidates } from './candidates'
import { checkEligibility } from './eligibility'
import { determineMahjub, filterEligibleHeirs } from './mahjub'
import { calculateFurudh, calculateTotalFurudh } from './furudh'
import { calculateAshabah } from './ashabah'
import { handleAwl } from './awl'
import { handleRadd } from './radd'
import { add, toNumber } from '../domain/fraction'
import {
  findSpouses,
  findSons,
  findDaughters,
  findFather,
  findMother,
  findSiblingsKandung,
  findSiblingsSeayah,
  findSiblingsSeibu,
  findGrandfather,
  findGrandmothers,
  findPaman,
  findCucuPengganti,
} from './relationship'

function genderLabel(base: string, anggotaId: string, facts: BoardData): string {
  const anggota = facts.anggota.find(a => a.id === anggotaId)
  return anggota?.gender === 'LAKI_LAKI' ? `${base} Laki-laki` : `${base} Perempuan`
}

function deriveHubungan(anggotaId: string, facts: BoardData, pewarisId: string, tanggalWarisan: string): string {
  const pewaris = facts.anggota.find(a => a.id === pewarisId)

  const spouses = findSpouses(pewarisId, facts, tanggalWarisan)
  if (spouses.includes(anggotaId)) {
    return pewaris?.gender === 'LAKI_LAKI' ? 'Istri' : 'Suami'
  }

  const sons = findSons(pewarisId, facts, tanggalWarisan)
  if (sons.includes(anggotaId)) return 'Anak Laki-laki'

  const daughters = findDaughters(pewarisId, facts, tanggalWarisan)
  if (daughters.includes(anggotaId)) return 'Anak Perempuan'

  const father = findFather(pewarisId, facts)
  if (father === anggotaId) return 'Ayah'

  const mother = findMother(pewarisId, facts)
  if (mother === anggotaId) return 'Ibu'

  const cucuPengganti = findCucuPengganti(pewarisId, facts, tanggalWarisan)
  const penggantian = cucuPengganti.find(c => c.cucuId === anggotaId)
  if (penggantian) {
    return genderLabel('Cucu', anggotaId, facts) + ' (Pengganti)'
  }

  const sibKandung = findSiblingsKandung(pewarisId, facts)
  if (sibKandung.includes(anggotaId)) return genderLabel('Saudara Kandung', anggotaId, facts)

  const sibSeayah = findSiblingsSeayah(pewarisId, facts)
  if (sibSeayah.includes(anggotaId)) return genderLabel('Saudara Seayah', anggotaId, facts)

  const sibSeibu = findSiblingsSeibu(pewarisId, facts)
  if (sibSeibu.includes(anggotaId)) return genderLabel('Saudara Seibu', anggotaId, facts)

  const grandfather = findGrandfather(pewarisId, facts)
  if (grandfather === anggotaId) return 'Kakek'

  const grandmothers = findGrandmothers(pewarisId, facts)
  if (grandmothers.includes(anggotaId)) return 'Nenek'

  const paman = findPaman(pewarisId, facts)
  if (paman.includes(anggotaId)) return 'Paman'

  return 'Ahli Waris Lainnya'
}

export function simulateInheritance(
  facts: BoardData,
  context: SimulationContext
): InheritanceResult {
  const steps: CalculationStep[] = []
  const { pewarisId, tanggalWarisan } = context

  const pewaris = facts.anggota.find(a => a.id === pewarisId)
  if (!pewaris) {
    return {
      pewarisId,
      hartaWarisanBersih: 0,
      ahliWaris: [],
      mahjub: [],
      calculation: [{ langkah: 'Error', detail: 'Pewaris tidak ditemukan' }],
    }
  }

  steps.push({
    langkah: 'Tentukan Pewaris',
    detail: `Pewaris: ${pewaris.nama}`,
  })

  let totalHarta = 0
  for (const harta of facts.harta) {
    const pemiliks = facts.pemilikHarta.filter(p => p.hartaId === harta.id)
    const pewarisPemilik = pemiliks.find(p => p.anggotaId === pewarisId)

    if (pewarisPemilik) {
      totalHarta += harta.nilaiSekarang * (pewarisPemilik.persentase / 100)
    }
  }

  steps.push({
    langkah: 'Tentukan Harta Warisan',
    detail: `Total harta pewaris: Rp ${totalHarta.toLocaleString('id-ID')}`,
  })

  const candidates = resolveCandidates(pewarisId, facts, tanggalWarisan)
  steps.push({
    langkah: 'Tentukan Kandidat',
    detail: `Ditemukan ${candidates.length} kandidat ahli waris`,
  })

  const eligibleHeirs = checkEligibility(candidates, facts, tanggalWarisan)
  steps.push({
    langkah: 'Cek Kelayakan',
    detail: `${eligibleHeirs.filter(h => h.isAlive).length} kandidat masih hidup`,
  })

  const mahjubResults = determineMahjub(eligibleHeirs, facts, pewarisId, tanggalWarisan)
  steps.push({
    langkah: 'Tentukan Mahjub',
    detail: `${mahjubResults.length} kandidat terhalang`,
  })

  const finalHeirs = filterEligibleHeirs(eligibleHeirs, mahjubResults)
  steps.push({
    langkah: 'Ahli Waris Final',
    detail: `${finalHeirs.length} ahli waris final`,
  })

  const pewarisSons = findSons(pewarisId, facts, tanggalWarisan)
  const pewarisDaughters = findDaughters(pewarisId, facts, tanggalWarisan)
  const hasChildren = finalHeirs.some(h =>
    pewarisSons.includes(h.anggotaId) || pewarisDaughters.includes(h.anggotaId)
  )

  const furudhShares = calculateFurudh(finalHeirs, facts, pewarisId, tanggalWarisan)
  const totalFurudh = calculateTotalFurudh(furudhShares)
  steps.push({
    langkah: 'Hitung Furudh',
    detail: `Total furudh: ${totalFurudh.numerator}/${totalFurudh.denominator}`,
  })

  const ashabahShares = calculateAshabah(finalHeirs, totalFurudh, totalHarta, facts, pewarisId, tanggalWarisan)
  steps.push({
    langkah: 'Hitung Ashabah',
    detail: `${ashabahShares.length} ahli waris ashabah`,
  })

  const allShares = [
    ...furudhShares,
    ...ashabahShares,
  ]

  const { shares: adjustedShares, isAwl } = handleAwl(allShares)
  if (isAwl) {
    steps.push({
      langkah: 'Tangani Awl',
      detail: 'Bagian melebihi harta, dilakukan pengurangan proporsional',
    })
  }

  const hasAshabah = ashabahShares.length > 0
  let finalShares = adjustedShares

  if (!hasAshabah && furudhShares.length > 0) {
    let totalAdjusted = { numerator: 0n, denominator: 1n }
    for (const share of adjustedShares) {
      totalAdjusted = add(totalAdjusted, share.bagian)
    }

    const remainder = {
      numerator: 1n * totalAdjusted.denominator - totalAdjusted.numerator,
      denominator: totalAdjusted.denominator,
    }

    if (remainder.numerator > 0n) {
      finalShares = handleRadd(
        adjustedShares.filter(s =>
          furudhShares.some(f => f.anggotaId === s.anggotaId)
        ),
        remainder,
        facts,
        pewarisId,
        tanggalWarisan
      )
      steps.push({
        langkah: 'Tangani Radd',
        detail: 'Sisa dikembalikan kepada ahli waris furudh',
      })
    }
  }

  const ahliWaris: AhliWarisResult[] = finalShares.map(share => {
    const heirKategori = finalHeirs.find(h => h.anggotaId === share.anggotaId)?.kategori
    return {
      anggotaId: share.anggotaId,
      hubungan: deriveHubungan(share.anggotaId, facts, pewarisId, tanggalWarisan),
      kategori: heirKategori ?? 'ASHABAH',
      bagian: share.bagian,
      nominal: totalHarta * toNumber(share.bagian),
      alasan: share.alasan,
    }
  })

  steps.push({
    langkah: 'Hasil Akhir',
    detail: `Total pembagian: ${ahliWaris.length} ahli waris`,
  })

  return {
    pewarisId,
    hartaWarisanBersih: totalHarta,
    ahliWaris,
    mahjub: mahjubResults,
    calculation: steps,
  }
}
