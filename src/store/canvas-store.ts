import { create } from 'zustand'

type NodePosition = {
  x: number
  y: number
}

type CanvasState = {
  zoom: number
  panX: number
  panY: number
  selectedIds: string[]
  nodePositions: Map<string, NodePosition>
  draggingNodeId: string | null
  dragOffset: { x: number; y: number } | null

  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  select: (ids: string[]) => void
  setNodePosition: (id: string, x: number, y: number) => void
  setDragging: (nodeId: string | null, offset?: { x: number; y: number }) => void
  getPositions: () => Map<string, NodePosition>
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  selectedIds: [],
  nodePositions: new Map(),
  draggingNodeId: null,
  dragOffset: null,

  setZoom: (zoom) => set({ zoom }),
  setPan: (panX, panY) => set({ panX, panY }),
  select: (ids) => set({ selectedIds: ids }),

  setNodePosition: (id, x, y) => {
    const positions = new Map(get().nodePositions)
    positions.set(id, { x, y })
    set({ nodePositions: positions })
  },

  setDragging: (nodeId, offset) => {
    set({ draggingNodeId: nodeId, dragOffset: offset || null })
  },

  getPositions: () => get().nodePositions,
}))
