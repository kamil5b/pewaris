import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { useFamilyStore } from '../../store/family-store'
import { v4 as uuidv4 } from 'uuid'
import type { JenisAkhir } from '../../domain/hubungan-horizontal'

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

  const [tanggalMulai, setTanggalMulai] = useState('')
  const [tanggalMulaiSah, setTanggalMulaiSah] = useState('')
  const [hasLegalMarriage, setHasLegalMarriage] = useState(false)
  const [isMarried, setIsMarried] = useState(true)
  const [tanggalBerakhir, setTanggalBerakhir] = useState('')
  const [tanggalBerakhirSah, setTanggalBerakhirSah] = useState('')
  const [jenisAkhir, setJenisAkhir] = useState<JenisAkhir>('CERAI_HIDUP')
  const [isNasabAyah, setIsNasabAyah] = useState(true)
  const [isAdopted, setIsAdopted] = useState(false)
  const [error, setError] = useState('')

  const source = anggota.find((a) => a.id === sourceId)
  const availableTargets = anggota.filter((a) => a.id !== sourceId)

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!sourceId || !targetId) {
      setError('Anggota tujuan wajib dipilih')
      return
    }

    if (connectionType === 'MARRIAGE') {
      if (connectedPartnerIds.includes(targetId)) {
        setError(`${anggota.find(a => a.id === targetId)?.nama} sudah terhubung sebagai pasangan`)
        return
      }

      addHubunganHorizontal({
        id: uuidv4(),
        anggotaAId: sourceId,
        anggotaBId: targetId,
        tanggalMulai: hasLegalMarriage ? (tanggalMulai || null) : null,
        tanggalMulaiSah: hasLegalMarriage ? (tanggalMulaiSah || null) : null,
        tanggalBerakhir: !hasLegalMarriage || isMarried ? null : (tanggalBerakhir || null),
        tanggalBerakhirSah: !hasLegalMarriage || isMarried ? null : (tanggalBerakhirSah || null),
        jenisAkhir: !hasLegalMarriage || isMarried ? null : jenisAkhir,
      })
    } else {
      if (!hubunganHorizontalId) {
        setError('Hubungan perkawinan orang tua wajib dipilih')
        return
      }

      if (marriages.some(h =>
        h.id === hubunganHorizontalId &&
        hubunganVertical.some(v =>
          v.anakId === targetId && v.hubunganHorizontalId === h.id
        )
      )) {
        setError('Anak sudah terhubung ke perkawinan ini')
        return
      }

      addHubunganVertical({
        id: uuidv4(),
        anakId: targetId,
        hubunganHorizontalId,
        isNasabAyah,
        isAdopted,
      })
    }

    setTargetId('')
    setHubunganHorizontalId('')
    setTanggalMulai('')
    setTanggalMulaiSah('')
    setHasLegalMarriage(false)
    setIsMarried(true)
    setTanggalBerakhir('')
    setTanggalBerakhirSah('')
    setJenisAkhir('CERAI_HIDUP')
    setIsNasabAyah(true)
    setIsAdopted(false)
    setError('')
    onClose()
  }

  const marriages = useFamilyStore((s) => s.hubunganHorizontal)
  const hubunganVertical = useFamilyStore((s) => s.hubunganVertical)

  const connectedPartnerIds = marriages
    .filter(h => sourceId && (h.anggotaAId === sourceId || h.anggotaBId === sourceId))
    .map(h => h.anggotaAId === sourceId ? h.anggotaBId : h.anggotaAId)

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
                  onChange={() => {
                    setConnectionType('MARRIAGE')
                    setError('')
                  }}
                />
                <span className="text-sm">💍 Perkawinan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="connectionType"
                  value="PARENT_CHILD"
                  checked={connectionType === 'PARENT_CHILD'}
                  onChange={() => {
                    setConnectionType('PARENT_CHILD')
                    setError('')
                  }}
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
              onChange={(e) => {
                setTargetId(e.target.value)
                setError('')
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih...</option>
              {availableTargets.map((a) => {
                const alreadyConnected = connectionType === 'MARRIAGE' && connectedPartnerIds.includes(a.id)
                return (
                  <option key={a.id} value={a.id} disabled={alreadyConnected}>
                    {a.nama}
                    {alreadyConnected ? ' (sudah terhubung)' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {connectionType === 'MARRIAGE' && (
            <>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLegalMarriage}
                    onChange={(e) => setHasLegalMarriage(e.target.checked)}
                    className="text-blue-500"
                  />
                  <span className="text-sm text-gray-600">Sudah Menikah</span>
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Jika tidak dicentang, hubungan ini tidak dianggap sebagai pernikahan sah.
                </p>
              </div>

              {hasLegalMarriage && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={tanggalMulai}
                      onChange={(e) => setTanggalMulai(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tanggal Mulai Sah</label>
                    <input
                      type="date"
                      value={tanggalMulaiSah}
                      onChange={(e) => setTanggalMulaiSah(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMarried}
                        onChange={(e) => setIsMarried(e.target.checked)}
                        className="text-blue-500"
                      />
                      <span className="text-sm text-gray-600">Masih menikah</span>
                    </label>
                  </div>

                  {!isMarried && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Jenis Akhir</label>
                        <select
                          value={jenisAkhir}
                          onChange={(e) => setJenisAkhir(e.target.value as JenisAkhir)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="CERAI_HIDUP">Cerai Hidup</option>
                          <option value="CERAI_MATI">Cerai Mati</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Tanggal Berakhir</label>
                        <input
                          type="date"
                          value={tanggalBerakhir}
                          onChange={(e) => setTanggalBerakhir(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Tanggal Berakhir Sah</label>
                        <input
                          type="date"
                          value={tanggalBerakhirSah}
                          onChange={(e) => setTanggalBerakhirSah(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {connectionType === 'PARENT_CHILD' && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Hubungan Perkawinan Orang Tua
                </label>
                <select
                  value={hubunganHorizontalId}
                  onChange={(e) => {
                    setHubunganHorizontalId(e.target.value)
                    setError('')
                  }}
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
              <div className="space-y-2">
                {(() => {
                  const childAnggota = targetId ? anggota.find(a => a.id === targetId) : null
                  const selectedMarriage = hubunganHorizontalId
                    ? marriages.find(h => h.id === hubunganHorizontalId)
                    : null

                  const bornBeforeMarriage = childAnggota && selectedMarriage
                    && selectedMarriage.tanggalMulaiSah !== null
                    && childAnggota.tanggalLahir < selectedMarriage.tanggalMulaiSah

                  const hasLegalMarriage = selectedMarriage?.tanggalMulaiSah !== null
                  const canEditNasab = bornBeforeMarriage

                  if (!canEditNasab && targetId && hubunganHorizontalId) {
                    if (isNasabAyah !== hasLegalMarriage) setIsNasabAyah(hasLegalMarriage)
                    if (isAdopted !== false) setIsAdopted(false)
                  }

                  return (
                    <>
                      <label className={`flex items-center gap-2 ${canEditNasab ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                        <input
                          type="checkbox"
                          checked={isNasabAyah}
                          disabled={!canEditNasab}
                          onChange={(e) => setIsNasabAyah(e.target.checked)}
                          className="text-blue-500"
                        />
                        <span className="text-sm text-gray-600">
                          Memiliki Hubungan Nasab dengan Ayah
                          {canEditNasab && (
                            <span className="text-xs text-gray-400 ml-1">(anak lahir sebelum pernikahan)</span>
                          )}
                        </span>
                      </label>
                      <label className={`flex items-center gap-2 ${canEditNasab ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                        <input
                          type="checkbox"
                          checked={isAdopted}
                          disabled={!canEditNasab}
                          onChange={(e) => setIsAdopted(e.target.checked)}
                          className="text-blue-500"
                        />
                        <span className="text-sm text-gray-600">Anak Angkat</span>
                      </label>
                    </>
                  )
                })()}
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
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
