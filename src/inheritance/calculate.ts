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
import { add, toNumber, createFraction } from '../domain/fraction'

export function simulateInheritance(
  facts: BoardData,
  context: SimulationContext
): InheritanceResult {
  const steps: CalculationStep[] = []
  const { pewarisId, tanggalKematian } = context

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

  const candidates = resolveCandidates(pewarisId, facts)
  steps.push({
    langkah: 'Tentukan Kandidat',
    detail: `Ditemukan ${candidates.length} kandidat ahli waris`,
  })

  const eligibleHeirs = checkEligibility(candidates, facts, tanggalKematian)
  steps.push({
    langkah: 'Cek Kelayakan',
    detail: `${eligibleHeirs.filter(h => h.isAlive).length} kandidat masih hidup`,
  })

  const mahjubResults = determineMahjub(eligibleHeirs, facts, pewarisId)
  steps.push({
    langkah: 'Tentukan Mahjub',
    detail: `${mahjubResults.length} kandidat terhalang`,
  })

  const finalHeirs = filterEligibleHeirs(eligibleHeirs, mahjubResults)
  steps.push({
    langkah: 'Ahli Waris Final',
    detail: `${finalHeirs.length} ahli waris final`,
  })

  const hasChildren = finalHeirs.some(
    h => h.hubungan === 'ANAK_LAKI' || h.hubungan === 'ANAK_PEREMPUAN'
  )

  const furudhShares = calculateFurudh(finalHeirs, hasChildren)
  const totalFurudh = calculateTotalFurudh(furudhShares)
  steps.push({
    langkah: 'Hitung Furudh',
    detail: `Total furudh: ${totalFurudh.numerator}/${totalFurudh.denominator}`,
  })

  const ashabahShares = calculateAshabah(finalHeirs, totalFurudh, totalHarta)
  steps.push({
    langkah: 'Hitung Ashabah',
    detail: `${ashabahShares.length} ahli waris ashabah`,
  })

  const allShares = [
    ...furudhShares.map(s => ({
      ...s,
      bagian: s.bagian,
    })),
    ...ashabahShares,
  ]

  console.log('All shares before awl:', allShares.map(s => ({
    hubungan: s.hubungan,
    bagian: s.bagian,
  })))

  const { shares: adjustedShares, isAwl } = handleAwl(allShares)

  console.log('All shares after awl:', adjustedShares.map(s => ({
    hubungan: s.hubungan,
    bagian: s.bagian,
  })))
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
        remainder
      )
      steps.push({
        langkah: 'Tangani Radd',
        detail: 'Sisa dikembalikan kepada ahli waris furudh',
      })
    }
  }

  const ahliWaris: AhliWarisResult[] = finalShares.map(share => ({
    anggotaId: share.anggotaId,
    hubungan: share.hubungan,
    bagian: share.bagian,
    nominal: totalHarta * toNumber(share.bagian),
    alasan: share.alasan,
  }))

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
