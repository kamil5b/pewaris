import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { useFamilyStore } from '../../store/family-store'
import { v4 as uuidv4 } from 'uuid'

type ConnectionType = 'MARRIAGE' | 'PARENT_CHILD'

type ConnectModalProps = {
  isOpen: boolean
  onClose: () => void
  sourceId: string | null
}

export function ConnectModal({ isOpen, onClose, sourceId }: ConnectModalProps) {
  const anggota = useFamilyStore((s) => s.anggota)
  const addHubunganHorizontal = useFamilyStore((s) => s.addHubunganHorizontal)
  const addHubunganVertical = useFamilyStore((s) => s.addHubunganVertical)

  const [connectionType, setConnectionType] = useState<ConnectionType>('MARRIAGE')
  const [targetId, setTargetId] = useState('')
  const [hubunganHorizontalId, setHubunganHorizontalId] = useState('')

  const source = anggota.find((a) => a.id === sourceId)
  const availableTargets = anggota.filter((a) => a.id !== sourceId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!sourceId || !targetId) return

    if (connectionType === 'MARRIAGE') {
      addHubunganHorizontal({
        id: uuidv4(),
        anggotaAId: sourceId,
        anggotaBId: targetId,
        tanggalMulai: new Date().toISOString().split('T')[0],
        tanggalMulaiSah: new Date().toISOString().split('T')[0],
        tanggalBerakhir: null,
        tanggalBerakhirSah: null,
        jenisAkhir: null,
      })
    } else {
      if (!hubunganHorizontalId) return

      addHubunganVertical({
        id: uuidv4(),
        anakId: targetId,
        hubunganHorizontalId,
        tanggalLahir: new Date().toISOString().split('T')[0],
      })
    }

    setTargetId('')
    setHubunganHorizontalId('')
    onClose()
  }

  const marriages = useFamilyStore((s) => s.hubunganHorizontal)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hubungkan Anggota">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              Menghubungkan: <span className="font-medium">{source?.nama || '-'}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Jenis Hubungan</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="connectionType"
                  value="MARRIAGE"
                  checked={connectionType === 'MARRIAGE'}
                  onChange={() => setConnectionType('MARRIAGE')}
                />
                <span className="text-sm">💍 Perkawinan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="connectionType"
                  value="PARENT_CHILD"
                  checked={connectionType === 'PARENT_CHILD'}
                  onChange={() => setConnectionType('PARENT_CHILD')}
                />
                <span className="text-sm">👶 Anak</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {connectionType === 'MARRIAGE' ? 'Pasangan' : 'Anak'}
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih...</option>
              {availableTargets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama} ({a.gender === 'LAKI_LAKI' ? 'L' : 'P'})
                </option>
              ))}
            </select>
          </div>

          {connectionType === 'PARENT_CHILD' && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Hubungan Perkawinan Orang Tua
              </label>
              <select
                value={hubunganHorizontalId}
                onChange={(e) => setHubunganHorizontalId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih...</option>
                {marriages.map((hub) => {
                  const anggotaA = anggota.find((a) => a.id === hub.anggotaAId)
                  const anggotaB = anggota.find((a) => a.id === hub.anggotaBId)
                  return (
                    <option key={hub.id} value={hub.id}>
                      {anggotaA?.nama} & {anggotaB?.nama}
                    </option>
                  )
                })}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            disabled={!targetId || (connectionType === 'PARENT_CHILD' && !hubunganHorizontalId)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Hubungkan
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
          >
            Batal
          </button>
        </div>
      </form>
    </Modal>
  )
}
