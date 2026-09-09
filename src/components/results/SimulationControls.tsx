import { useFamilyStore } from '../../store/family-store'
import { useSimulationStore } from '../../store/simulation-store'

export function SimulationControls() {
  const anggota = useFamilyStore((s) => s.anggota)
  const pewarisId = useSimulationStore((s) => s.pewarisId)
  const tanggalKematian = useSimulationStore((s) => s.tanggalKematian)
  const setPewaris = useSimulationStore((s) => s.setPewaris)
  const setTanggalKematian = useSimulationStore((s) => s.setTanggalKematian)
  const calculate = useSimulationStore((s) => s.calculate)

  return (
    <div className="p-4 border-b">
      <h2 className="text-lg font-semibold mb-3">Simulasi</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Pewaris</label>
          <select
            value={pewarisId || ''}
            onChange={(e) => setPewaris(e.target.value || null)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Pilih pewaris...</option>
            {anggota.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Tanggal Kematian
          </label>
          <input
            type="date"
            value={tanggalKematian}
            onChange={(e) => setTanggalKematian(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <button
          onClick={calculate}
          disabled={!pewarisId}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Hitung Waris
        </button>
      </div>
    </div>
  )
}
