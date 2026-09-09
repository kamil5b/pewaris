import type { Fraction } from '../../domain/fraction'

type FractionDisplayProps = {
  fraction: Fraction
}

export function FractionDisplay({ fraction }: FractionDisplayProps) {
  if (fraction.denominator === 1n) {
    return <span>{fraction.numerator.toString()}</span>
  }

  return (
    <span>
      {fraction.numerator.toString()}/{fraction.denominator.toString()}
    </span>
  )
}
