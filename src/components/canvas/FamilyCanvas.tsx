import { useRef, useEffect, useCallback, useState } from 'react'
import { useFamilyStore } from '../../store/family-store'
import { useCanvasStore } from '../../store/canvas-store'
import { useSimulationStore } from '../../store/simulation-store'
import { renderFrame, type CanvasRenderState, computeMarriageMidpoint } from '../../canvas/renderer'
import { autoLayout } from '../../canvas/layout'
import { screenToCanvas } from '../../canvas/coordinates'
import { hitTestNode } from '../../canvas/nodes'
import { hitTestMarriageConnection, hitTestParentChildConnection } from '../../canvas/connections'
import type { MarriageConnection, ParentChildConnection } from '../../canvas/connections'
import { ContextMenu } from './ContextMenu'
import { ConnectModal } from './ConnectModal'
import { EditConnectionModal } from './EditConnectionModal'

type ConnectionRef = {
  id: string
  type: 'HORIZONTAL' | 'VERTICAL'
}

type FamilyCanvasProps = {
  onAddAnggota: () => void
  onClearCanvas: () => void
}

export function FamilyCanvas({ onAddAnggota, onClearCanvas }: FamilyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panningRef = useRef(false)

  const anggota = useFamilyStore((s) => s.anggota)
  const hubunganHorizontal = useFamilyStore((s) => s.hubunganHorizontal)
  const hubunganVertical = useFamilyStore((s) => s.hubunganVertical)

  const zoom = useCanvasStore((s) => s.zoom)
  const panX = useCanvasStore((s) => s.panX)
  const panY = useCanvasStore((s) => s.panY)
  const selectedIds = useCanvasStore((s) => s.selectedIds)
  const nodePositions = useCanvasStore((s) => s.nodePositions)
  const draggingNodeId = useCanvasStore((s) => s.draggingNodeId)
  const dragOffset = useCanvasStore((s) => s.dragOffset)
  const setZoom = useCanvasStore((s) => s.setZoom)
  const setPan = useCanvasStore((s) => s.setPan)
  const select = useCanvasStore((s) => s.select)
  const setNodePosition = useCanvasStore((s) => s.setNodePosition)
  const setDragging = useCanvasStore((s) => s.setDragging)

  const pewarisId = useSimulationStore((s) => s.pewarisId)

  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    nodeId: string | null
    connection: ConnectionRef | null
  } | null>(null)

  const [connectModal, setConnectModal] = useState<{
    isOpen: boolean
    sourceId: string | null
    type: 'MARRIAGE' | 'PARENT_CHILD'
    presetMarriageId: string | null
  }>({ isOpen: false, sourceId: null, type: 'MARRIAGE', presetMarriageId: null })

  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    hubId: string | null
    hubType: 'HORIZONTAL' | 'VERTICAL'
  }>({ isOpen: false, hubId: null, hubType: 'HORIZONTAL' })

  const positions = nodePositions.size > 0 ? nodePositions : undefined
  const nodes = autoLayout(anggota, hubunganHorizontal, hubunganVertical, positions)

  const marriageConnections: MarriageConnection[] = hubunganHorizontal.map((hub) => {
    const nodeA = nodes.find((n) => n.id === hub.anggotaAId)
    const nodeB = nodes.find((n) => n.id === hub.anggotaBId)
    return {
      id: hub.id,
      nodeA: nodeA!,
      nodeB: nodeB!,
      isActive: hub.tanggalBerakhir === null,
    }
  }).filter((c) => c.nodeA && c.nodeB)

  const parentChildConnections: ParentChildConnection[] = hubunganVertical.map((vert) => {
    const hub = hubunganHorizontal.find((h) => h.id === vert.hubunganHorizontalId)
    if (!hub) return null

    const nodeA = nodes.find((n) => n.id === hub.anggotaAId)
    const nodeB = nodes.find((n) => n.id === hub.anggotaBId)
    const childNode = nodes.find((n) => n.id === vert.anakId)

    if (!nodeA || !nodeB || !childNode) return null

    const { midX, midY } = computeMarriageMidpoint(nodeA, nodeB)

    return {
      id: vert.id,
      marriageMidX: midX,
      marriageMidY: midY,
      childNode,
    }
  }).filter((c): c is ParentChildConnection => c !== null)

  const renderState: CanvasRenderState = {
    nodes,
    marriageConnections,
    parentChildConnections,
    transform: { zoom, panX, panY },
    selectedIds,
    pewarisId,
  }

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()

      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.min(Math.max(zoom * delta, 0.1), 3)
        setZoom(newZoom)
        return
      }

      if (e.shiftKey) {
        setPan(panX - e.deltaY, panY)
        return
      }

      setPan(panX - e.deltaX, panY - e.deltaY)
    },
    [zoom, panX, panY, setZoom, setPan]
  )

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button === 2) return

      setContextMenu(null)

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const canvasPoint = screenToCanvas(x, y, { zoom, panX, panY })

      const clickedNode = nodes.find((node) =>
        hitTestNode(canvasPoint.x, canvasPoint.y, node)
      )

      if (clickedNode) {
        if (e.shiftKey) {
          select(
            selectedIds.includes(clickedNode.id)
              ? selectedIds.filter((id) => id !== clickedNode.id)
              : [...selectedIds, clickedNode.id]
          )
        } else {
          select([clickedNode.id])
        }

        setDragging(clickedNode.id, {
          x: canvasPoint.x - clickedNode.x,
          y: canvasPoint.y - clickedNode.y,
        })
      } else {
        select([])
        panningRef.current = true
      }
    },
    [zoom, panX, panY, nodes, selectedIds, select, setDragging]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      if (panningRef.current && e.buttons === 1) {
        setPan(panX + e.movementX, panY + e.movementY)
        return
      }

      if (draggingNodeId && dragOffset && e.buttons === 1) {
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const canvasPoint = screenToCanvas(x, y, { zoom, panX, panY })
        setNodePosition(
          draggingNodeId,
          canvasPoint.x - dragOffset.x,
          canvasPoint.y - dragOffset.y
        )
      }
    },
    [panX, panY, setPan, draggingNodeId, dragOffset, zoom, setNodePosition]
  )

  const handleMouseUp = useCallback(() => {
    panningRef.current = false
    setDragging(null)
  }, [setDragging])

  const getContextTarget = useCallback(
    (canvasX: number, canvasY: number): { nodeId: string | null; connection: ConnectionRef | null } => {
      const clickedNode = nodes.find((node) =>
        hitTestNode(canvasX, canvasY, node)
      )

      if (clickedNode) {
        return { nodeId: clickedNode.id, connection: null }
      }

      const clickedMarriage = marriageConnections.find((conn) =>
        hitTestMarriageConnection(conn, canvasX, canvasY)
      )
      if (clickedMarriage) {
        return { nodeId: null, connection: { id: clickedMarriage.id, type: 'HORIZONTAL' } }
      }

      const clickedVertical = parentChildConnections.find((conn) =>
        hitTestParentChildConnection(conn, canvasX, canvasY)
      )

      return {
        nodeId: null,
        connection: clickedVertical
          ? { id: clickedVertical.id, type: 'VERTICAL' }
          : null,
      }
    },
    [nodes, marriageConnections, parentChildConnections]
  )

  const handleDblClick = useCallback(
    (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const canvasPoint = screenToCanvas(x, y, { zoom, panX, panY })

      const target = getContextTarget(canvasPoint.x, canvasPoint.y)

      if (target.nodeId || target.connection) {
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          ...target,
        })
      }
    },
    [zoom, panX, panY, getContextTarget]
  )

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const canvasPoint = screenToCanvas(x, y, { zoom, panX, panY })

      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        ...getContextTarget(canvasPoint.x, canvasPoint.y),
      })
    },
    [zoom, panX, panY, getContextTarget]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('dblclick', handleDblClick)
    canvas.addEventListener('contextmenu', handleContextMenu)

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('dblclick', handleDblClick)
      canvas.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleDblClick, handleContextMenu])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvas.width = width
        canvas.height = height
      }
    })

    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const context = ctx

    let animationId: number

    function animate() {
      renderFrame(context, renderState)
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [renderState])

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-default"
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          connection={contextMenu.connection}
          onClose={() => setContextMenu(null)}
          onConnect={(type) =>
            setConnectModal({ isOpen: true, sourceId: contextMenu.nodeId, type, presetMarriageId: null })
          }
          onEditConnection={(conn) => setEditModal({ isOpen: true, hubId: conn.id, hubType: conn.type })}
          onAddAnggota={onAddAnggota}
          onClearCanvas={onClearCanvas}
          onAddChildToMarriage={(marriageId) =>
            setConnectModal({
              isOpen: true,
              sourceId: null,
              type: 'PARENT_CHILD',
              presetMarriageId: marriageId,
            })
          }
        />
      )}

      <ConnectModal
        key={`${connectModal.type}-${connectModal.presetMarriageId ?? 'none'}`}
        isOpen={connectModal.isOpen}
        onClose={() =>
          setConnectModal({ isOpen: false, sourceId: null, type: 'MARRIAGE', presetMarriageId: null })
        }
        sourceId={connectModal.sourceId}
        initialType={connectModal.type}
        presetMarriageId={connectModal.presetMarriageId}
      />

      <EditConnectionModal
        key={editModal.hubId || 'none'}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, hubId: null, hubType: 'HORIZONTAL' })}
        hubId={editModal.hubId}
        hubType={editModal.hubType}
      />
    </div>
  )
}