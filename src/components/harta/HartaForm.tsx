import { useState } from 'react'
import { useAssetStore } from '../../store/asset-store'
import { useFamilyStore } from '../../store/family-store'
import { v4 as uuidv4 } from 'uuid'

type HartaFormProps = {
  onSave: () => void
  onCancel: () => void
}

type OwnerRow = {
  anggotaId: string
  persentase: string
}

export function HartaForm({ onSave, onCancel }: HartaFormProps) {
  const addHarta = useAssetStore((s) => s.addHarta)
  const addPemilikHarta = useAssetStore((s) => s.addPemilikHarta)
  const anggota = useFamilyStore((s) => s.anggota)

  const [nama, setNama] = useState('')
  const [nilaiBeli, setNilaiBeli] = useState('')
  const [nilaiSekarang, setNilaiSekarang] = useState('')
  const [pemilikAsli, setPemilikAsli] = useState('')
  const [ownerRows, setOwnerRows] = useState<OwnerRow[]>([
    { anggotaId: '', persentase: '100' },
  ])
  const [error, setError] = useState('')

  const updateRow = (index: number, patch: Partial<OwnerRow>) =>
    setOwnerRows((rows) =>
      rows.map((r, i) => (i === index ? { ...r, ...patch } : r))
    )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nama.trim()) {
      setError('Nama harta wajib diisi')
      return
    }
    if (!nilaiBeli) {
      setError('Nilai beli wajib diisi')
      return
    }
    if (!nilaiSekarang) {
      setError('Nilai sekarang wajib diisi')
      return
    }

    const beli = Number(nilaiBeli)
    const sekarang = Number(nilaiSekarang)
    if (isNaN(beli) || beli <= 0 || isNaN(sekarang) || sekarang <= 0) {
      setError('Nilai harus berupa angka lebih dari 0')
      return
    }

    if (ownerRows.some((r) => !r.anggotaId)) {
      setError('Pilih pemilik untuk setiap kolom pemilik')
      return
    }

    const ownerIds = ownerRows.map((r) => r.anggotaId)
    if (new Set(ownerIds).size !== ownerIds.length) {
      setError('Pemilik tidak boleh berulang')
      return
    }

    const persens = ownerRows.map((r) => Number(r.persentase))
    const totalPersen = persens.reduce((sum, p) => sum + p, 0)
    if (persens.some((p) => isNaN(p) || p <= 0) || totalPersen !== 100) {
      setError('Total persentase pemilik harus 100% (setiap bagian lebih dari 0)')
      return
    }

    const hartaId = uuidv4()
    addHarta({
      id: hartaId,
      anggotaId: pemilikAsli,
      nama: nama.trim(),
      nilaiBeli: beli,
      nilaiSekarang: sekarang,
    })

    ownerRows.forEach((r) =>
      addPemilikHarta({
        id: uuidv4(),
        hartaId,
        anggotaId: r.anggotaId,
        persentase: Number(r.persentase),
      })
    )

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
            onChange={(e) => {
              setNama(e.target.value)
              setError('')
            }}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Contoh: Rumah, Tanah, Mobil"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Nilai Beli (Rp)</label>
          <input
            type="number"
            value={nilaiBeli}
            onChange={(e) => {
              setNilaiBeli(e.target.value)
              setError('')
            }}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Nilai Sekarang (Rp)</label>
          <input
            type="number"
            value={nilaiSekarang}
            onChange={(e) => {
              setNilaiSekarang(e.target.value)
              setError('')
            }}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Pemilik Asli (Pemilik Sebelumnya)</label>
          <select
            value={pemilikAsli}
            onChange={(e) => {
              setPemilikAsli(e.target.value)
              setError('')
            }}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tidak ada</option>
            {anggota.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Pemilik asli dapat berbeda dari pemilik saat ini (lihat "Pemilik Harta" di bawah).
          </p>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Pemilik Saat Ini</label>
          {anggota.length === 0 && (
            <p className="text-xs text-gray-400 mb-2">
              Belum ada anggota. Tambahkan anggota terlebih dahulu di canvas.
            </p>
          )}
          {ownerRows.map((row, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <select
                value={row.anggotaId}
                onChange={(e) => {
                  updateRow(i, { anggotaId: e.target.value })
                  setError('')
                }}
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih pemilik...</option>
                {anggota.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nama}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={100}
                value={row.persentase}
                onChange={(e) => {
                  updateRow(i, { persentase: e.target.value })
                  setError('')
                }}
                className="w-20 px-3 py-2 border rounded-lg text-sm"
                placeholder="%"
              />
              <span className="text-sm text-gray-500 self-center">%</span>
              <button
                type="button"
                onClick={() => {
                  setOwnerRows((rows) => rows.filter((_, idx) => idx !== i))
                  setError('')
                }}
                disabled={ownerRows.length === 1}
                className={`self-center ${ownerRows.length === 1 ? 'text-gray-300' : 'text-red-500 hover:text-red-700'}`}
                aria-label="Hapus pemilik"
              >
                🗑️
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setOwnerRows((rows) => [...rows, { anggotaId: '', persentase: '' }])
              setError('')
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Tambah Pemilik
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

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