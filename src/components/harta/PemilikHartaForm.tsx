import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { useAssetStore } from '../../store/asset-store'
import { useFamilyStore } from '../../store/family-store'
import { v4 as uuidv4 } from 'uuid'

type PemilikHartaFormProps = {
  isOpen: boolean
  onClose: () => void
  hartaId: string
  hartaNama: string
  pemilikAsliId: string
}

type OwnerRow = {
  rowKey: string
  pemilikId: string | null
  anggotaId: string
  persentase: string
}

export function PemilikHartaForm({ isOpen, onClose, hartaId, hartaNama, pemilikAsliId }: PemilikHartaFormProps) {
  const pemilikHarta = useAssetStore((s) => s.pemilikHarta)
  const addPemilikHarta = useAssetStore((s) => s.addPemilikHarta)
  const updatePemilikHarta = useAssetStore((s) => s.updatePemilikHarta)
  const removePemilikHarta = useAssetStore((s) => s.removePemilikHarta)
  const updateHarta = useAssetStore((s) => s.updateHarta)
  const anggota = useFamilyStore((s) => s.anggota)

  const [rows, setRows] = useState<OwnerRow[]>([])
  const [pemilikAsli, setPemilikAsli] = useState(pemilikAsliId)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setPemilikAsli(pemilikAsliId)
    setRows(
      pemilikHarta
        .filter((p) => p.hartaId === hartaId)
        .map((p) => ({
          rowKey: p.id,
          pemilikId: p.id,
          anggotaId: p.anggotaId,
          persentase: String(p.persentase),
        }))
    )
    setError('')
  }, [isOpen, hartaId, pemilikHarta, pemilikAsliId])

  const updateRow = (rowKey: string, patch: Partial<OwnerRow>) =>
    setRows((rs) => rs.map((r) => (r.rowKey === rowKey ? { ...r, ...patch } : r)))

  const handleSave = () => {
    if (rows.some((r) => !r.anggotaId)) {
      setError('Pilih pemilik untuk setiap kolom pemilik')
      return
    }

    const ownerIds = rows.map((r) => r.anggotaId)
    if (new Set(ownerIds).size !== ownerIds.length) {
      setError('Pemilik tidak boleh berulang')
      return
    }

    const persens = rows.map((r) => Number(r.persentase))
    const totalPersen = persens.reduce((sum, p) => sum + p, 0)
    if (persens.some((p) => isNaN(p) || p <= 0) || totalPersen !== 100) {
      setError('Total persentase pemilik harus 100% (setiap bagian lebih dari 0)')
      return
    }

    const savedIds = new Set<string>()
    updateHarta(hartaId, { anggotaId: pemilikAsli })

    rows.forEach((r) => {
      if (r.pemilikId) {
        updatePemilikHarta(r.pemilikId, {
          anggotaId: r.anggotaId,
          persentase: Number(r.persentase),
        })
        savedIds.add(r.pemilikId)
      } else {
        addPemilikHarta({
          id: uuidv4(),
          hartaId,
          anggotaId: r.anggotaId,
          persentase: Number(r.persentase),
        })
      }
    })

    pemilikHarta
      .filter((p) => p.hartaId === hartaId && !savedIds.has(p.id))
      .forEach((p) => removePemilikHarta(p.id))

    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pemilik: ${hartaNama}`}>
      <div className="space-y-3">
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
        </div>

        <div>
          <span className="block text-sm text-gray-600 mb-1">Pemilik Saat Ini</span>
          {rows.map((row) => (
          <div key={row.rowKey} className="flex gap-2">
            <select
              value={row.anggotaId}
              onChange={(e) => {
                updateRow(row.rowKey, { anggotaId: e.target.value })
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
                updateRow(row.rowKey, { persentase: e.target.value })
                setError('')
              }}
              className="w-20 px-3 py-2 border rounded-lg text-sm"
              placeholder="%"
            />
            <span className="text-sm text-gray-500 self-center">%</span>
            <button
              onClick={() => {
                setRows((rs) => rs.filter((r) => r.rowKey !== row.rowKey))
                setError('')
              }}
              disabled={rows.length === 1}
              className={`self-center ${rows.length === 1 ? 'text-gray-300' : 'text-red-500 hover:text-red-700'}`}
              aria-label="Hapus pemilik"
            >
              🗑️
            </button>
          </div>
        ))}

        <button
          onClick={() => {
            setRows((rs) => [
              ...rs,
              { rowKey: uuidv4(), pemilikId: null, anggotaId: '', persentase: '' },
            ])
            setError('')
          }}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + Tambah Pemilik
        </button>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
          >
            Simpan
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
          >
            Batal
          </button>
        </div>
        </div>
      </div>
    </Modal>
  )
}