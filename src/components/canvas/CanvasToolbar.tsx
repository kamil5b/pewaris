import { useState } from 'react'
import { useCanvasStore, type CanvasTool } from '../../store/canvas-store'
import { useFamilyStore } from '../../store/family-store'
import { useAssetStore } from '../../store/asset-store'
import { useSimulationStore } from '../../store/simulation-store'
import { AddAnggotaModal } from './AddAnggotaModal'
import { Modal } from '../ui/Modal'

const tools: { tool: CanvasTool; label: string; icon: string; shortcut: string }[] = [
  { tool: 'SELECT', label: 'Select', icon: '↖', shortcut: '1' },
  { tool: 'HAND', label: 'Hand', icon: '✋', shortcut: '2' },
  { tool: 'CONNECT', label: 'Connect', icon: '⤴', shortcut: '3' },
]

export function CanvasToolbar() {
  const activeTool = useCanvasStore((s) => s.activeTool)
  const setTool = useCanvasStore((s) => s.setTool)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)

  const handleClear = () => {
    useFamilyStore.setState({
      anggota: [],
      hubunganHorizontal: [],
      hubunganVertical: [],
    })
    useAssetStore.setState({
      harta: [],
      pemilikHarta: [],
    })
    useSimulationStore.setState({
      pewarisId: null,
      result: null,
    })
    useCanvasStore.setState({
      nodePositions: new Map(),
      selectedIds: [],
    })
    setIsClearModalOpen(false)
  }

  return (
    <>
      <div className="flex items-center gap-2 p-2 bg-white border-b">
        <div className="flex gap-1">
          {tools.map(({ tool, label, icon, shortcut }) => (
            <button
              key={tool}
              onClick={() => setTool(tool)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                activeTool === tool
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={`${label} (${shortcut})`}
            >
              <span className="mr-1">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200" />

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3 py-1.5 rounded text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
        >
          + Anggota
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setIsClearModalOpen(true)}
          className="px-3 py-1.5 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
        >
          🗑️ Clear
        </button>
      </div>

      <AddAnggotaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Hapus Semua Data?"
      >
        <p className="text-sm text-gray-600 mb-4">
          Semua anggota, hubungan, harta, dan hasil simulasi akan dihapus. 
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
          >
            Ya, Hapus Semua
          </button>
          <button
            onClick={() => setIsClearModalOpen(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
          >
            Batal
          </button>
        </div>
      </Modal>
    </>
  )
}
