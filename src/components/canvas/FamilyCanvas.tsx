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

export function FamilyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const anggota = useFamilyStore((s) => s.anggota)
  const hubunganHorizontal = useFamilyStore((s) => s.hubunganHorizontal)
  const hubunganVertical = useFamilyStore((s) => s.hubunganVertical)

  const zoom = useCanvasStore((s) => s.zoom)
  const panX = useCanvasStore((s) => s.panX)
  const panY = useCanvasStore((s) => s.panY)
  const selectedIds = useCanvasStore((s) => s.selectedIds)
  const activeTool = useCanvasStore((s) => s.activeTool)
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
  }>({ isOpen: false, sourceId: null, type: 'MARRIAGE' })

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
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.min(Math.max(zoom * delta, 0.1), 3)
      setZoom(newZoom)
    },
    [zoom, setZoom]
  )

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button === 2) return

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const canvasPoint = screenToCanvas(x, y, { zoom, panX, panY })

      const clickedNode = nodes.find((node) =>
        hitTestNode(canvasPoint.x, canvasPoint.y, node)
      )

      if (activeTool === 'HAND') {
        return
      }

      if (clickedNode) {
        if (activeTool === 'SELECT') {
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
        }
      } else {
        select([])
      }
    },
    [activeTool, zoom, panX, panY, nodes, selectedIds, select, setDragging]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (activeTool === 'HAND' && e.buttons === 1) {
        setPan(panX + e.movementX, panY + e.movementY)
        return
      }

      if (draggingNodeId && dragOffset && e.buttons === 1) {
        const canvasPoint = screenToCanvas(x, y, { zoom, panX, panY })
        setNodePosition(
          draggingNodeId,
          canvasPoint.x - dragOffset.x,
          canvasPoint.y - dragOffset.y
        )
      }
    },
    [activeTool, panX, panY, setPan, draggingNodeId, dragOffset, zoom, setNodePosition]
  )

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [setDragging])

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const canvasPoint = screenToCanvas(x, y, { zoom, panX, panY })

      const clickedNode = nodes.find((node) =>
        hitTestNode(canvasPoint.x, canvasPoint.y, node)
      )

      if (clickedNode) {
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          nodeId: clickedNode.id,
          connection: null,
        })
        return
      }

      const clickedMarriage = marriageConnections.find((conn) =>
        hitTestMarriageConnection(conn, canvasPoint.x, canvasPoint.y)
      )
      if (clickedMarriage) {
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          nodeId: null,
          connection: { id: clickedMarriage.id, type: 'HORIZONTAL' },
        })
        return
      }

      const clickedVertical = parentChildConnections.find((conn) =>
        hitTestParentChildConnection(conn, canvasPoint.x, canvasPoint.y)
      )

      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        nodeId: null,
        connection: clickedVertical
          ? { id: clickedVertical.id, type: 'VERTICAL' }
          : null,
      })
    },
    [zoom, panX, panY, nodes, marriageConnections, parentChildConnections]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('contextmenu', handleContextMenu)

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleContextMenu])

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

    let animationId: number

    function animate() {
      renderFrame(ctx, renderState)
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [renderState])

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${
          activeTool === 'HAND' ? 'cursor-grab' : 
          activeTool === 'CONNECT' ? 'cursor-crosshair' : 
          'cursor-default'
        }`}
      />
      <div className="absolute top-2 left-2 bg-white/90 rounded-lg shadow p-2 text-sm text-gray-500">
        {activeTool === 'SELECT' ? 'Klik untuk pilih, drag untuk geser' :
         activeTool === 'HAND' ? 'Drag untuk menggeser canvas' :
         'Klik anggota untuk menghubungkan'} | Zoom: {Math.round(zoom * 100)}%
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          connection={contextMenu.connection}
          onClose={() => setContextMenu(null)}
          onConnect={(type) => setConnectModal({ isOpen: true, sourceId: contextMenu.nodeId, type })}
          onEditConnection={(conn) => setEditModal({ isOpen: true, hubId: conn.id, hubType: conn.type })}
        />
      )}

      <ConnectModal
        isOpen={connectModal.isOpen}
        onClose={() => setConnectModal({ isOpen: false, sourceId: null, type: 'MARRIAGE' })}
        sourceId={connectModal.sourceId}
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
