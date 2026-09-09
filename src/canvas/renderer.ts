import type { AnggotaNode } from './nodes'
import { drawAnggotaNode } from './nodes'
import {
  drawMarriageConnection,
  drawParentChildConnection,
  type MarriageConnection,
  type ParentChildConnection,
} from './connections'
import type { Transform } from './coordinates'

export type CanvasRenderState = {
  nodes: AnggotaNode[]
  marriageConnections: MarriageConnection[]
  parentChildConnections: ParentChildConnection[]
  transform: Transform
  selectedIds: string[]
  pewarisId: string | null
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: CanvasRenderState
): void {
  const { width, height } = ctx.canvas

  ctx.clearRect(0, 0, width, height)

  ctx.fillStyle = '#f9fafb'
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.translate(state.transform.panX, state.transform.panY)
  ctx.scale(state.transform.zoom, state.transform.zoom)

  drawGrid(ctx, width, height, state.transform)

  for (const conn of state.parentChildConnections) {
    drawParentChildConnection(ctx, conn)
  }

  for (const conn of state.marriageConnections) {
    drawMarriageConnection(ctx, conn)
  }

  for (const node of state.nodes) {
    const isSelected = state.selectedIds.includes(node.id)
    const isPewaris = node.id === state.pewarisId
    drawAnggotaNode(ctx, node, isSelected, isPewaris)
  }

  ctx.restore()
}

export function computeMarriageMidpoint(
  nodeA: AnggotaNode,
  nodeB: AnggotaNode
): { midX: number; midY: number } {
  const x1 = nodeA.x + nodeA.width / 2
  const y1 = nodeA.y + nodeA.height
  const x2 = nodeB.x + nodeB.width / 2
  const y2 = nodeB.y + nodeB.height

  return {
    midX: (x1 + x2) / 2,
    midY: Math.max(y1, y2) + 20,
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  transform: Transform
): void {
  const gridSize = 50
  const scaledGridSize = gridSize * transform.zoom

  const startX = (transform.panX % scaledGridSize) - scaledGridSize
  const startY = (transform.panY % scaledGridSize) - scaledGridSize

  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1

  for (let x = startX; x < width; x += scaledGridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  for (let y = startY; y < height; y += scaledGridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}
