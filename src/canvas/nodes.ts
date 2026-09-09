import type { Gender } from '../domain/anggota'

export type AnggotaNode = {
  id: string
  nama: string
  gender: Gender
  x: number
  y: number
  width: number
  height: number
}

const NODE_WIDTH = 120
const NODE_HEIGHT = 140
const NODE_RADIUS = 8

export function drawAnggotaNode(
  ctx: CanvasRenderingContext2D,
  node: AnggotaNode,
  isSelected: boolean,
  isPewaris: boolean
): void {
  const { x, y, width, height, nama, gender } = node

  ctx.save()

  if (isSelected) {
    ctx.shadowColor = '#3b82f6'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  ctx.beginPath()
  ctx.roundRect(x, y, width, height, NODE_RADIUS)

  if (isPewaris) {
    ctx.fillStyle = '#fef3c7'
    ctx.strokeStyle = '#f59e0b'
  } else if (gender === 'LAKI_LAKI') {
    ctx.fillStyle = '#eff6ff'
    ctx.strokeStyle = isSelected ? '#3b82f6' : '#93c5fd'
  } else {
    ctx.fillStyle = '#fdf2f8'
    ctx.strokeStyle = isSelected ? '#3b82f6' : '#f9a8d4'
  }

  ctx.fill()
  ctx.lineWidth = isSelected ? 2 : 1
  ctx.stroke()

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  const centerX = x + width / 2

  ctx.fillStyle = gender === 'LAKI_LAKI' ? '#3b82f6' : '#ec4899'
  ctx.font = 'bold 24px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(gender === 'LAKI_LAKI' ? '♂' : '♀', centerX, y + 40)

  ctx.fillStyle = '#111827'
  ctx.font = '13px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const maxWidth = width - 16
  const text = nama.length > 12 ? nama.slice(0, 11) + '...' : nama
  ctx.fillText(text, centerX, y + 80)

  ctx.fillStyle = '#6b7280'
  ctx.font = '11px system-ui, sans-serif'
  ctx.fillText(gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan', centerX, y + 100)

  ctx.restore()
}

export function createAnggotaNode(
  id: string,
  nama: string,
  gender: Gender,
  x: number,
  y: number
): AnggotaNode {
  return {
    id,
    nama,
    gender,
    x,
    y,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  }
}

export function hitTestNode(
  x: number,
  y: number,
  node: AnggotaNode
): boolean {
  return (
    x >= node.x &&
    x <= node.x + node.width &&
    y >= node.y &&
    y <= node.y + node.height
  )
}
