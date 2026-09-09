import { useState } from 'react'
import { useAssetStore } from '../../store/asset-store'
import { v4 as uuidv4 } from 'uuid'

type HartaFormProps = {
  onSave: () => void
  onCancel: () => void
}

export function HartaForm({ onSave, onCancel }: HartaFormProps) {
  const addHarta = useAssetStore((s) => s.addHarta)

  const [nama, setNama] = useState('')
  const [nilaiBeli, setNilaiBeli] = useState('')
  const [nilaiSekarang, setNilaiSekarang] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nama || !nilaiBeli || !nilaiSekarang) {
      alert('Semua field harus diisi')
      return
    }

    addHarta({
      id: uuidv4(),
      anggotaId: '',
      nama,
      nilaiBeli: Number(nilaiBeli),
      nilaiSekarang: Number(nilaiSekarang),
    })

    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="font-medium mb-3">Tambah Harta Baru</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Nama Harta</label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Contoh: Rumah, Tanah, Mobil"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Nilai Beli (Rp)</label>
          <input
            type="number"
            value={nilaiBeli}
            onChange={(e) => setNilaiBeli(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Nilai Sekarang (Rp)</label>
          <input
            type="number"
            value={nilaiSekarang}
            onChange={(e) => setNilaiSekarang(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
        >
          Simpan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
        >
          Batal
        </button>
      </div>
    </form>
  )
}
