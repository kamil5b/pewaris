import { useState } from 'react'
import { useAssetStore } from '../../store/asset-store'
import { HartaForm } from './HartaForm'
import { HartaListItem } from './HartaListItem'
import { HartaSummary } from './HartaSummary'

export function HartaPanel() {
  const harta = useAssetStore((s) => s.harta)
  const [isAdding, setIsAdding] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Harta</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            + Harta
          </button>
        </div>
        <HartaSummary />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isAdding && (
          <HartaForm
            onSave={() => setIsAdding(false)}
            onCancel={() => setIsAdding(false)}
          />
        )}

        <div className="space-y-2">
          {harta.map((item) => (
            <HartaListItem key={item.id} harta={item} />
          ))}
        </div>

        {harta.length === 0 && !isAdding && (
          <p className="text-center text-gray-500 py-8">
            Belum ada harta. Klik "+ Harta" untuk menambahkan.
          </p>
        )}
      </div>
    </div>
  )
}
