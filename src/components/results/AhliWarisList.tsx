import { useState } from 'react'
import type { AhliWarisResult } from '../../inheritance/result'
import { FractionDisplay } from './FractionDisplay'

type AhliWarisListProps = {
  ahliWaris: AhliWarisResult[]
}

export function AhliWarisList({ ahliWaris }: AhliWarisListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (ahliWaris.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        Tidak ada ahli waris yang ditemukan
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {ahliWaris.map((waris) => (
        <div key={waris.anggotaId} className="bg-white border rounded-lg p-3">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() =>
              setExpandedId(expandedId === waris.anggotaId ? null : waris.anggotaId)
            }
          >
            <div>
              <p className="font-medium">{waris.hubungan}</p>
              <p className="text-sm text-gray-500">
                <FractionDisplay fraction={waris.bagian} />
                {' · '}
                Rp {waris.nominal.toLocaleString('id-ID')}
              </p>
            </div>
            <span className="text-gray-400">
              {expandedId === waris.anggotaId ? '▲' : '▼'}
            </span>
          </div>

          {expandedId === waris.anggotaId && (
            <div className="mt-2 pt-2 border-t text-sm text-gray-600">
              <p className="font-medium mb-1">Alasan:</p>
              <ul className="list-disc list-inside">
                {waris.alasan.map((reason, i) => (
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
