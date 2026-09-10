import type { BoardData } from '../domain/simulation'
import type { Candidate, KategoriWaris } from './result'
import {
  findSpouses,
  findSons,
  findDaughters,
  findFather,
  findMother,
  findGrandchildrenFromSon,
  findSiblingsKandung,
  findSiblingsSeayah,
  findSiblingsSeibu,
  findGrandfather,
  findGrandmothers,
  findPaman,
  findCucuPengganti,
} from './relationship'

function isAlive(anggotaId: string, board: BoardData, tanggalWarisan: string): boolean {
  const a = board.anggota.find(x => x.id === anggotaId)
  if (!a) return false
  if (!a.tanggalKematian) return true
  return a.tanggalKematian > tanggalWarisan
}

function isNasabValid(anggotaId: string, board: BoardData): boolean {
  const vert = board.hubunganVertical.find(v => v.anakId === anggotaId)
  if (!vert) return true
  if (vert.isAdopted) return false
  if (!vert.isNasabAyah) return false
  return true
}

function addCandidate(
  candidates: Candidate[],
  added: Set<string>,
  anggotaId: string,
  kategori: KategoriWaris
) {
  if (!added.has(anggotaId)) {
    candidates.push({ anggotaId, kategori })
    added.add(anggotaId)
  }
}

export function resolveCandidates(
  pewarisId: string,
  board: BoardData,
  tanggalWarisan: string
): Candidate[] {
  const candidates: Candidate[] = []
  const added = new Set<string>()

  const spouses = findSpouses(pewarisId, board, tanggalWarisan)
  for (const spouseId of spouses) {
    if (!isAlive(spouseId, board, tanggalWarisan)) continue
    addCandidate(candidates, added, spouseId, 'FURUDH')
  }

  const sons = findSons(pewarisId, board, tanggalWarisan)
  for (const sonId of sons) {
    if (!isAlive(sonId, board, tanggalWarisan)) continue
    if (!isNasabValid(sonId, board)) continue
    addCandidate(candidates, added, sonId, 'ASHABAH')
  }

  const daughters = findDaughters(pewarisId, board, tanggalWarisan)
  for (const daughterId of daughters) {
    if (!isAlive(daughterId, board, tanggalWarisan)) continue
    if (!isNasabValid(daughterId, board)) continue
    addCandidate(candidates, added, daughterId, 'FURUDH')
  }

  const cucuPengganti = findCucuPengganti(pewarisId, board, tanggalWarisan)
  for (const cp of cucuPengganti) {
    if (!isAlive(cp.cucuId, board, tanggalWarisan)) continue
    addCandidate(candidates, added, cp.cucuId, 'PENGGANTI')
  }

  const grandsons = findGrandchildrenFromSon(pewarisId, board, tanggalWarisan)
  for (const gcId of grandsons) {
    if (!isAlive(gcId, board, tanggalWarisan)) continue
    if (!isNasabValid(gcId, board)) continue
    addCandidate(candidates, added, gcId, 'ASHABAH')
  }

  const granddaughters = findGrandchildrenFromSon(pewarisId, board, tanggalWarisan)
    .filter(id => !grandsons.includes(id))
  for (const gdId of granddaughters) {
    if (!isAlive(gdId, board, tanggalWarisan)) continue
    if (!isNasabValid(gdId, board)) continue
    addCandidate(candidates, added, gdId, 'FURUDH')
  }

  const father = findFather(pewarisId, board)
  if (father && isAlive(father, board, tanggalWarisan)) {
    addCandidate(candidates, added, father, 'FURUDH')
  }

  const mother = findMother(pewarisId, board)
  if (mother && isAlive(mother, board, tanggalWarisan)) {
    addCandidate(candidates, added, mother, 'FURUDH')
  }

  const siblingsKandung = findSiblingsKandung(pewarisId, board)
  for (const sibId of siblingsKandung) {
    if (!isAlive(sibId, board, tanggalWarisan)) continue
    if (!isNasabValid(sibId, board)) continue
    const sibAnggota = board.anggota.find(a => a.id === sibId)
    const kategori = sibAnggota?.gender === 'LAKI_LAKI' ? 'ASHABAH' : 'FURUDH'
    addCandidate(candidates, added, sibId, kategori)
  }

  const siblingsSeayah = findSiblingsSeayah(pewarisId, board)
  for (const sibId of siblingsSeayah) {
    if (!isAlive(sibId, board, tanggalWarisan)) continue
    if (!isNasabValid(sibId, board)) continue
    const sibAnggota = board.anggota.find(a => a.id === sibId)
    const kategori = sibAnggota?.gender === 'LAKI_LAKI' ? 'ASHABAH' : 'FURUDH'
    addCandidate(candidates, added, sibId, kategori)
  }

  const siblingsSeibu = findSiblingsSeibu(pewarisId, board)
  for (const sibId of siblingsSeibu) {
    if (!isAlive(sibId, board, tanggalWarisan)) continue
    addCandidate(candidates, added, sibId, 'FURUDH')
  }

  const grandfather = findGrandfather(pewarisId, board)
  if (grandfather && isAlive(grandfather, board, tanggalWarisan)) {
    addCandidate(candidates, added, grandfather, 'FURUDH')
  }

  const grandmothers = findGrandmothers(pewarisId, board)
  for (const gmId of grandmothers) {
    if (!isAlive(gmId, board, tanggalWarisan)) continue
    addCandidate(candidates, added, gmId, 'FURUDH')
  }

  const paman = findPaman(pewarisId, board)
  for (const pId of paman) {
    if (!isAlive(pId, board, tanggalWarisan)) continue
    addCandidate(candidates, added, pId, 'ASHABAH')
  }

  return candidates
}
