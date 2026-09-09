import { useState } from 'react'
import { FamilyCanvas } from './canvas/FamilyCanvas'
import { CanvasToolbar } from './canvas/CanvasToolbar'
import { HartaPanel } from './harta/HartaPanel'
import { ResultsPanel } from './results/ResultsPanel'
import { useAutoSave } from '../db/use-auto-save'
import { useLoadData } from '../db/use-load-data'

type Panel = 'harta' | 'results'

export default function App() {
  useAutoSave()
  const { isLoading } = useLoadData()

  const [activePanel, setActivePanel] = useState<Panel>('results')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b px-4 py-3">
        <h1 className="text-xl font-bold">Pewaris</h1>
        <p className="text-sm text-gray-500">Kalkulator Waris Islam</p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r">
          <CanvasToolbar />
          <div className="flex-1">
            <FamilyCanvas />
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
    </div>
  )
}
