import { useState } from 'react'
import type { MahjubResult } from '../../inheritance/result'

type MahjubListProps = {
  mahjub: MahjubResult[]
}

export function MahjubList({ mahjub }: MahjubListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (mahjub.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        Tidak ada ahli waris yang terhalang
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {mahjub.map((m) => (
        <div key={m.anggotaId} className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() =>
              setExpandedId(expandedId === m.anggotaId ? null : m.anggotaId)
            }
          >
            <div>
              <p className="font-medium text-red-700">{m.hubungan}</p>
              <p className="text-sm text-red-500">Terhalang (Mahjub)</p>
            </div>
            <span className="text-red-400">
              {expandedId === m.anggotaId ? '▲' : '▼'}
            </span>
          </div>

          {expandedId === m.anggotaId && (
            <div className="mt-2 pt-2 border-t border-red-200 text-sm text-red-600">
              <p className="font-medium mb-1">Alasan:</p>
              <ul className="list-disc list-inside">
                {m.alasan.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
