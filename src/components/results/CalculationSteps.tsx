import { useState } from 'react'
import type { CalculationStep } from '../../inheritance/result'

type CalculationStepsProps = {
  steps: CalculationStep[]
}

export function CalculationSteps({ steps }: CalculationStepsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (steps.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-medium text-sm">Langkah Perhitungan</span>
        <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="text-gray-400 w-6">{i + 1}.</span>
              <div>
                <p className="font-medium">{step.langkah}</p>
                <p className="text-gray-600">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
