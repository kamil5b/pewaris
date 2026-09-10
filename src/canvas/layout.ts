import type { Anggota } from '../domain/anggota'
import type { HubunganHorizontal } from '../domain/hubungan-horizontal'
import type { HubunganVertical } from '../domain/hubungan-vertical'
import { createAnggotaNode, type AnggotaNode } from './nodes'

const NODE_SPACING_X = 180
const NODE_SPACING_Y = 200

export function autoLayout(
  anggota: Anggota[],
  hubunganHorizontal: HubunganHorizontal[],
  hubunganVertical: HubunganVertical[],
  existingPositions?: Map<string, { x: number; y: number }>
): AnggotaNode[] {
  if (anggota.length === 0) return []

  const nodes = new Map<string, AnggotaNode>()
  const childrenMap = new Map<string, string[]>()

  for (const hub of hubunganVertical) {
    const existing = childrenMap.get(hub.hubunganHorizontalId) || []
    existing.push(hub.anakId)
    childrenMap.set(hub.hubunganHorizontalId, existing)
  }

  if (existingPositions) {
    for (const anggotaItem of anggota) {
      const pos = existingPositions.get(anggotaItem.id)
      if (pos) {
        const node = createAnggotaNode(
          anggotaItem.id,
          anggotaItem.nama,
          anggotaItem.gender,
          anggotaItem.tanggalLahir,
          anggotaItem.tanggalKematian,
          pos.x,
          pos.y
        )
        nodes.set(anggotaItem.id, node)
      }
    }

    if (nodes.size === anggota.length) {
      return Array.from(nodes.values())
    }
  }

  const firstAnggota = anggota[0]
  const centerX = 400
  const centerY = 100

  const firstNode = createAnggotaNode(
    firstAnggota.id,
    firstAnggota.nama,
    firstAnggota.gender,
    firstAnggota.tanggalLahir,
    firstAnggota.tanggalKematian,
    centerX - 60,
    centerY
  )
  nodes.set(firstAnggota.id, firstNode)

  const childNodes = new Set<string>()
  for (const children of childrenMap.values()) {
    for (const childId of children) {
      childNodes.add(childId)
    }
  }

  const spouses = new Set<string>()
  for (const hub of hubunganHorizontal) {
    spouses.add(hub.anggotaAId)
    spouses.add(hub.anggotaBId)
  }

  let spouseX = centerX + NODE_SPACING_X
  for (const hub of hubunganHorizontal) {
    if (hub.anggotaAId === firstAnggota.id && !nodes.has(hub.anggotaBId)) {
      const spouse = anggota.find(a => a.id === hub.anggotaBId)
      if (spouse) {
        const node = createAnggotaNode(
          spouse.id,
          spouse.nama,
          spouse.gender,
          spouse.tanggalLahir,
          spouse.tanggalKematian,
          spouseX,
          centerY
        )
        nodes.set(spouse.id, node)
        spouseX += NODE_SPACING_X
      }
    } else if (hub.anggotaBId === firstAnggota.id && !nodes.has(hub.anggotaAId)) {
      const spouse = anggota.find(a => a.id === hub.anggotaAId)
      if (spouse) {
        const node = createAnggotaNode(
          spouse.id,
          spouse.nama,
          spouse.gender,
          spouse.tanggalLahir,
          spouse.tanggalKematian,
          centerX - NODE_SPACING_X - 60,
          centerY
        )
        nodes.set(spouse.id, node)
      }
    }
  }

  let childY = centerY + NODE_SPACING_Y
  for (const hub of hubunganHorizontal) {
    const children = childrenMap.get(hub.id) || []
    if (children.length === 0) continue

    const nodeA = nodes.get(hub.anggotaAId)
    const nodeB = nodes.get(hub.anggotaBId)
    const parentX = nodeA && nodeB
      ? (nodeA.x + nodeB.x + nodeA.width) / 2
      : (nodeA?.x || nodeB?.x || centerX) + 60

    let childX = parentX - ((children.length - 1) * NODE_SPACING_X) / 2

    for (const childId of children) {
      if (!nodes.has(childId)) {
        const childAnggota = anggota.find(a => a.id === childId)
        if (childAnggota) {
          const node = createAnggotaNode(
            childId,
            childAnggota.nama,
            childAnggota.gender,
            childAnggota.tanggalLahir,
            childAnggota.tanggalKematian,
            childX,
            childY
          )
          nodes.set(childId, node)
        }
      }
      childX += NODE_SPACING_X
    }

    childY += NODE_SPACING_Y
  }

  let orphansX = centerX + NODE_SPACING_X * 2
  for (const anggotaItem of anggota) {
    if (!nodes.has(anggotaItem.id)) {
      const node = createAnggotaNode(
        anggotaItem.id,
        anggotaItem.nama,
        anggotaItem.gender,
        anggotaItem.tanggalLahir,
        anggotaItem.tanggalKematian,
        orphansX,
        centerY
      )
      nodes.set(anggotaItem.id, node)
      orphansX += NODE_SPACING_X
    }
  }

  return Array.from(nodes.values())
}
