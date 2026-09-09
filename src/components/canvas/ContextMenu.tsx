import { useFamilyStore } from '../../store/family-store'
import { useCanvasStore } from '../../store/canvas-store'
import { useSimulationStore } from '../../store/simulation-store'

type ContextMenuProps = {
  x: number
  y: number
  nodeId: string | null
  onClose: () => void
  onConnect: (type: 'MARRIAGE' | 'PARENT_CHILD') => void
}

export function ContextMenu({ x, y, nodeId, onClose, onConnect }: ContextMenuProps) {
  const anggota = useFamilyStore((s) => s.anggota)
  const removeAnggota = useFamilyStore((s) => s.removeAnggota)
  const select = useCanvasStore((s) => s.select)
  const setPewaris = useSimulationStore((s) => s.setPewaris)

  const node = nodeId ? anggota.find((a) => a.id === nodeId) : null

  const handleDelete = () => {
    if (!nodeId) return
    if (confirm(`Hapus ${node?.nama}?`)) {
      removeAnggota(nodeId)
      select([])
    }
    onClose()
  }

  const handleSetPewaris = () => {
    if (!nodeId) return
    setPewaris(nodeId)
    onClose()
  }

  if (!node) return null

  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg border py-1 z-50"
      style={{ left: x, top: y }}
    >
      <button
        onClick={handleSetPewaris}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
      >
        ⚰️ Jadikan Pewaris
      </button>
      <button
        onClick={() => { onConnect('MARRIAGE'); onClose() }}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
      >
        💍 Tambah Perkawinan
      </button>
      <button
        onClick={() => { onConnect('PARENT_CHILD'); onClose() }}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
      >
        👶 Tambah Anak
      </button>
      <hr className="my-1" />
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
      >
        🗑️ Hapus
      </button>
    </div>
  )
}
