import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { useFamilyStore } from '../../store/family-store'
import type { JenisAkhir } from '../../domain/hubungan-horizontal'

type EditConnectionModalProps = {
  isOpen: boolean
  onClose: () => void
  hubId: string | null
  hubType: 'HORIZONTAL' | 'VERTICAL'
}

export function EditConnectionModal({ isOpen, onClose, hubId, hubType }: EditConnectionModalProps) {
  const anggota = useFamilyStore((s) => s.anggota)
  const hubunganHorizontal = useFamilyStore((s) => s.hubunganHorizontal)
  const hubunganVertical = useFamilyStore((s) => s.hubunganVertical)
  const updateHubunganHorizontal = useFamilyStore((s) => s.updateHubunganHorizontal)
  const updateHubunganVertical = useFamilyStore((s) => s.updateHubunganVertical)

  const hub = hubunganHorizontal.find((h) => h.id === hubId)
  const vert = hubunganVertical.find((v) => v.id === hubId)

  const [error, setError] = useState('')

  const [tanggalMulai, setTanggalMulai] = useState(hub?.tanggalMulai ?? '')
  const [tanggalMulaiSah, setTanggalMulaiSah] = useState(hub?.tanggalMulaiSah ?? '')
  const [hasLegalMarriage, setHasLegalMarriage] = useState(hub?.tanggalMulaiSah !== null)
  const [isMarried, setIsMarried] = useState(hub?.tanggalBerakhirSah === null)
  const [tanggalBerakhir, setTanggalBerakhir] = useState(hub?.tanggalBerakhir ?? '')
  const [tanggalBerakhirSah, setTanggalBerakhirSah] = useState(hub?.tanggalBerakhirSah ?? '')
  const [jenisAkhir, setJenisAkhir] = useState<JenisAkhir>(hub?.jenisAkhir ?? 'CERAI_HIDUP')

  const [isNasabAyah, setIsNasabAyah] = useState(vert?.isNasabAyah ?? false)
  const [isAdopted, setIsAdopted] = useState(vert?.isAdopted ?? false)

  const childAnggota = vert ? anggota.find((a) => a.id === vert.anakId) : null
  const marriageOfVert = vert
    ? hubunganHorizontal.find((h) => h.id === vert.hubunganHorizontalId)
    : null

  const bornBeforeMarriage = childAnggota && marriageOfVert
    && marriageOfVert.tanggalMulaiSah !== null
    && childAnggota.tanggalLahir < marriageOfVert.tanggalMulaiSah

  const canEditNasab = !!bornBeforeMarriage

  useEffect(() => {
    if (hubType === 'VERTICAL' && marriageOfVert && !canEditNasab) {
      setIsNasabAyah(marriageOfVert.tanggalMulaiSah !== null)
      setIsAdopted(false)
    }
  }, [hubType, marriageOfVert, canEditNasab])

  if (hubType === 'HORIZONTAL' && !hub) return null
  if (hubType === 'VERTICAL' && !vert) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (hubType === 'HORIZONTAL') {
      updateHubunganHorizontal(hub!.id, {
        tanggalMulai: hasLegalMarriage ? (tanggalMulai || null) : null,
        tanggalMulaiSah: hasLegalMarriage ? (tanggalMulaiSah || null) : null,
        tanggalBerakhir: !hasLegalMarriage || isMarried ? null : (tanggalBerakhir || null),
        tanggalBerakhirSah: !hasLegalMarriage || isMarried ? null : (tanggalBerakhirSah || null),
        jenisAkhir: !hasLegalMarriage || isMarried ? null : jenisAkhir,
      })
    } else {
      updateHubunganVertical(vert!.id, { isNasabAyah, isAdopted })
    }

    onClose()
  }

  const hubunganName =
    hubType === 'HORIZONTAL'
      ? (() => {
          const a = anggota.find((x) => x.id === hub!.anggotaAId)
          const b = anggota.find((x) => x.id === hub!.anggotaBId)
          return `${a?.nama || '?'} & ${b?.nama || '?'}`
        })()
      : childAnggota?.nama || ''

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={hubType === 'HORIZONTAL' ? `Edit Perkawinan: ${hubunganName}` : `Edit Anak: ${hubunganName}`}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {hubType === 'HORIZONTAL' && (
            <>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLegalMarriage}
                    onChange={(e) => {
                      setHasLegalMarriage(e.target.checked)
                      setError('')
                    }}
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
                      onChange={(e) => {
                        setTanggalMulai(e.target.value)
                        setError('')
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tanggal Mulai Sah</label>
                    <input
                      type="date"
                      value={tanggalMulaiSah}
                      onChange={(e) => {
                        setTanggalMulaiSah(e.target.value)
                        setError('')
                      }}
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
                          onChange={(e) => {
                            setTanggalBerakhir(e.target.value)
                            setError('')
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Tanggal Berakhir Sah</label>
                        <input
                          type="date"
                          value={tanggalBerakhirSah}
                          onChange={(e) => {
                            setTanggalBerakhirSah(e.target.value)
                            setError('')
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {hubType === 'VERTICAL' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Anak: <span className="font-medium">{childAnggota?.nama}</span>
              </p>
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
            </div>
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
            Simpan Perubahan
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