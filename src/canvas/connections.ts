import type { AnggotaNode } from './nodes'

export type MarriageConnection = {
  id: string
  nodeA: AnggotaNode
  nodeB: AnggotaNode
  isActive: boolean
}

export type ParentChildConnection = {
  id: string
  marriageMidX: number
  marriageMidY: number
  childNode: AnggotaNode
}

export function drawMarriageConnection(
  ctx: CanvasRenderingContext2D,
  conn: MarriageConnection
): { midX: number; midY: number } {
  const { nodeA, nodeB, isActive } = conn

  const x1 = nodeA.x + nodeA.width / 2
  const y1 = nodeA.y + nodeA.height
  const x2 = nodeB.x + nodeB.width / 2
  const y2 = nodeB.y + nodeB.height

  const midX = (x1 + x2) / 2
  const midY = Math.max(y1, y2) + 20

  ctx.save()

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.quadraticCurveTo(x1, midY, midX, midY)
  ctx.quadraticCurveTo(x2, midY, x2, y2)

  ctx.strokeStyle = isActive ? '#10b981' : '#9ca3af'
  ctx.lineWidth = 2
  ctx.setLineDash(isActive ? [] : [5, 5])
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(midX, midY - 5, 4, 0, Math.PI * 2)
  ctx.fillStyle = isActive ? '#10b981' : '#9ca3af'
  ctx.fill()

  ctx.restore()

  return { midX, midY }
}

export function drawParentChildConnection(
  ctx: CanvasRenderingContext2D,
  conn: ParentChildConnection
): void {
  const { marriageMidX, marriageMidY, childNode } = conn

  const childX = childNode.x + childNode.width / 2
  const childY = childNode.y

  const startY = marriageMidY - 5
  const midY = (startY + childY) / 2

  ctx.save()

  ctx.beginPath()
  ctx.moveTo(marriageMidX, startY)
  ctx.lineTo(marriageMidX, midY)
  ctx.lineTo(childX, midY)
  ctx.lineTo(childX, childY)

  ctx.strokeStyle = '#6366f1'
  ctx.lineWidth = 2
  ctx.setLineDash([])
  ctx.stroke()

  ctx.restore()
}
