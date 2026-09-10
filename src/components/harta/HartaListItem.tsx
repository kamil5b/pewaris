import { useState } from 'react'
import { useAssetStore } from '../../store/asset-store'
import { useFamilyStore } from '../../store/family-store'
import type { Harta } from '../../domain/harta'
import { PemilikHartaForm } from './PemilikHartaForm'

type HartaListItemProps = {
  harta: Harta
}

export function HartaListItem({ harta }: HartaListItemProps) {
  const pemilikHarta = useAssetStore((s) => s.pemilikHarta)
  const removeHarta = useAssetStore((s) => s.removeHarta)
  const anggota = useFamilyStore((s) => s.anggota)
  const [isEditPemilikOpen, setIsEditPemilikOpen] = useState(false)

  const owners = pemilikHarta.filter((p) => p.hartaId === harta.id)
  const pemilikAsliNama = harta.anggotaId
    ? anggota.find((a) => a.id === harta.anggotaId)?.nama
    : null

  const handleDelete = () => {
    if (confirm(`Hapus ${harta.nama}?`)) {
      removeHarta(harta.id)
    }
  }

  return (
    <div className="bg-white border rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{harta.nama}</h4>
          <p className="text-sm text-gray-500">
            Nilai Beli: Rp {harta.nilaiBeli.toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-gray-500">
            Nilai Sekarang: Rp {harta.nilaiSekarang.toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {pemilikAsliNama
              ? `Pemilik Asli: ${pemilikAsliNama}`
              : 'Belum ada pemilik asli'}
          </p>
          <p className="text-sm text-gray-500">
            {owners.length > 0
              ? owners
                  .map((p) => {
                    const nama = anggota.find((a) => a.id === p.anggotaId)?.nama
                    return `${nama || '?'} (${p.persentase}%)`
                  })
                  .join(', ')
              : 'Belum ada pemilik saat ini'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => setIsEditPemilikOpen(true)}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ✏️ Pemilik
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Hapus
          </button>
        </div>
      </div>

      <PemilikHartaForm
        isOpen={isEditPemilikOpen}
        onClose={() => setIsEditPemilikOpen(false)}
        hartaId={harta.id}
        hartaNama={harta.nama}
        pemilikAsliId={harta.anggotaId}
      />
    </div>
  )
}