import { useSimulationStore } from '../../store/simulation-store'
import { SimulationControls } from './SimulationControls'
import { AhliWarisList } from './AhliWarisList'
import { MahjubList } from './MahjubList'
import { CalculationSteps } from './CalculationSteps'

export function ResultsPanel() {
  const result = useSimulationStore((s) => s.result)

  return (
    <div className="flex flex-col h-full">
      <SimulationControls />

      <div className="flex-1 overflow-y-auto p-4">
        {result && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <h3 className="font-medium text-blue-700 mb-1">Harta Waris Bersih</h3>
              <p className="text-xl font-bold text-blue-800">
                Rp {result.hartaWarisanBersih.toLocaleString('id-ID')}
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Ahli Waris</h3>
              <AhliWarisList ahliWaris={result.ahliWaris} />
            </div>

            <div>
              <h3 className="font-medium mb-2">Mahjub</h3>
              <MahjubList mahjub={result.mahjub} />
            </div>

            <CalculationSteps steps={result.calculation} />
          </div>
        )}

        {!result && (
          <p className="text-center text-gray-500 py-8">
            Pilih pewaris dan klik "Hitung Waris" untuk melihat hasil
          </p>
        )}
      </div>
    </div>
  )
}
