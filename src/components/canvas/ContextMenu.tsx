import { useFamilyStore } from '../../store/family-store'
import { useCanvasStore } from '../../store/canvas-store'
import { useSimulationStore } from '../../store/simulation-store'

type ConnectionRef = {
  id: string
  type: 'HORIZONTAL' | 'VERTICAL'
}

type ContextMenuProps = {
  x: number
  y: number
  nodeId: string | null
  connection?: ConnectionRef | null
  onClose: () => void
  onConnect: (type: 'MARRIAGE' | 'PARENT_CHILD') => void
  onEditConnection: (conn: ConnectionRef) => void
  onAddAnggota: () => void
  onClearCanvas: () => void
  onAddChildToMarriage: (marriageId: string) => void
}

export function ContextMenu({
  x,
  y,
  nodeId,
  connection,
  onClose,
  onConnect,
  onEditConnection,
  onAddAnggota,
  onClearCanvas,
  onAddChildToMarriage,
}: ContextMenuProps) {
  const anggota = useFamilyStore((s) => s.anggota)
  const hubunganHorizontal = useFamilyStore((s) => s.hubunganHorizontal)
  const hubunganVertical = useFamilyStore((s) => s.hubunganVertical)
  const removeAnggota = useFamilyStore((s) => s.removeAnggota)
  const removeHubunganHorizontal = useFamilyStore((s) => s.removeHubunganHorizontal)
  const removeHubunganVertical = useFamilyStore((s) => s.removeHubunganVertical)
  const select = useCanvasStore((s) => s.select)
  const setPewaris = useSimulationStore((s) => s.setPewaris)

  const node = nodeId ? anggota.find((a) => a.id === nodeId) : null

  const connectionName = (() => {
    if (!connection) return ''
    if (connection.type === 'HORIZONTAL') {
      const hub = hubunganHorizontal.find((h) => h.id === connection.id)
      if (!hub) return ''
      const a = anggota.find((x) => x.id === hub.anggotaAId)
      const b = anggota.find((x) => x.id === hub.anggotaBId)
      return `${a?.nama || '?'} & ${b?.nama || '?'}`
    }
    const vert = hubunganVertical.find((v) => v.id === connection.id)
    if (!vert) return ''
    const anak = anggota.find((x) => x.id === vert.anakId)
    return anak?.nama || ''
  })()

  const menuTitle = node?.nama || (connection ? `🔗 ${connectionName}` : 'Canvas')

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

  const handleDeleteConnection = () => {
    if (!connection) return
    if (confirm(`Hapus hubungan ${connectionName}?`)) {
      if (connection.type === 'HORIZONTAL') {
        removeHubunganHorizontal(connection.id)
      } else {
        removeHubunganVertical(connection.id)
      }
    }
    onClose()
  }

  const isBlank = !node && !connection

  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg border py-1 z-50"
      style={{ left: x, top: y }}
    >
      <div className="flex items-center justify-between px-4 pt-1">
        <span className="text-xs font-semibold text-gray-500 truncate">{menuTitle}</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-sm leading-none"
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>

      {isBlank && (
        <>
          <button
            onClick={() => { onAddAnggota(); onClose() }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
          >
            👤 Tambah Anggota
          </button>
          <button
            onClick={() => { onClearCanvas(); onClose() }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            🗑️ Clear Canvas
          </button>
        </>
      )}

      {node && (
        <>
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
        </>
      )}

      {connection && connection.type === 'HORIZONTAL' && (
        <>
          <button
            onClick={() => { onEditConnection(connection); onClose() }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
          >
            ✏️ Edit Hubungan
          </button>
          <button
            onClick={() => { onAddChildToMarriage(connection.id); onClose() }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
          >
            👶 Tambah Anak ke Perkawinan Ini
          </button>
          <hr className="my-1" />
          <button
            onClick={handleDeleteConnection}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            🗑️ Hapus Hubungan
          </button>
        </>
      )}

      {connection && connection.type === 'VERTICAL' && (
        <>
          <button
            onClick={() => { onEditConnection(connection); onClose() }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
          >
            ✏️ Edit Hubungan
          </button>
          <button
            onClick={handleDeleteConnection}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            🗑️ Hapus Hubungan
          </button>
        </>
      )}
    </div>
  )
}