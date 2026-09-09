import { useAssetStore } from '../../store/asset-store'
import type { Harta } from '../../domain/harta'

type HartaListItemProps = {
  harta: Harta
}

export function HartaListItem({ harta }: HartaListItemProps) {
  const removeHarta = useAssetStore((s) => s.removeHarta)

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
        </div>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Hapus
        </button>
      </div>
    </div>
  )
}
