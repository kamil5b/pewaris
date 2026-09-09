import { useAssetStore } from '../../store/asset-store'

export function HartaSummary() {
  const harta = useAssetStore((s) => s.harta)

  const totalNilaiBeli = harta.reduce((sum, h) => sum + h.nilaiBeli, 0)
  const totalNilaiSekarang = harta.reduce((sum, h) => sum + h.nilaiSekarang, 0)

  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-gray-500">Total Harta</p>
        <p className="font-semibold">{harta.length} item</p>
      </div>
      <div>
        <p className="text-gray-500">Total Nilai Sekarang</p>
        <p className="font-semibold">
          Rp {totalNilaiSekarang.toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  )
}
