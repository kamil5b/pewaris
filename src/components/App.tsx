import { useState } from 'react'
import { FamilyCanvas } from './canvas/FamilyCanvas'
import { AddAnggotaModal } from './canvas/AddAnggotaModal'
import { HartaPanel } from './harta/HartaPanel'
import { ResultsPanel } from './results/ResultsPanel'
import { Modal } from './ui/Modal'
import { TutorialModal } from './ui/TutorialModal'
import { ImportExport } from './data/ImportExport'
import { useCanvasStore } from '../store/canvas-store'
import { useFamilyStore } from '../store/family-store'
import { useAssetStore } from '../store/asset-store'
import { useSimulationStore } from '../store/simulation-store'
import { useAutoSave } from '../db/use-auto-save'
import { useLoadData } from '../db/use-load-data'

type Panel = 'harta' | 'results'

export default function App() {
  useAutoSave()
  const { isLoading } = useLoadData()

  const [activePanel, setActivePanel] = useState<Panel>('results')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)

  const zoom = useCanvasStore((s) => s.zoom)
  const setZoom = useCanvasStore((s) => s.setZoom)

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Pewaris</h1>
          <p className="text-sm text-gray-500">Kalkulator Waris Islam</p>
        </div>

        <div className="flex items-center gap-2">
            <ImportExport />

            <div className="flex items-center gap-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setZoom(Math.max(zoom * 0.9, 0.1))}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-l-lg"
              title="Perkecil"
            >
              −
            </button>
            <span className="text-sm text-gray-600 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(1)}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
              title="Reset zoom"
            >
              ⟳
            </button>
            <button
              onClick={() => setZoom(Math.min(zoom * 1.1, 3))}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-r-lg"
              title="Perbesar"
            >
              +
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
          >
            + Anggota
          </button>

          <button
            onClick={() => setIsTutorialOpen(true)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            📖 Tutorial
          </button>

          <button
            onClick={() => setIsClearModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
          >
            🗑️ Clear
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r">
          <div className="flex-1">
            <FamilyCanvas
              onAddAnggota={() => setIsAddModalOpen(true)}
              onClearCanvas={() => setIsClearModalOpen(true)}
            />
          </div>
        </div>

        <div className="w-80 flex flex-col">
          <div className="flex border-b">
            <button
              onClick={() => setActivePanel('harta')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activePanel === 'harta'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Harta
            </button>
            <button
              onClick={() => setActivePanel('results')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activePanel === 'results'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Hasil
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activePanel === 'harta' ? <HartaPanel /> : <ResultsPanel />}
          </div>
        </div>
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

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  )
}