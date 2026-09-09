export type Fraction = {
  numerator: bigint
  denominator: bigint
}

function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  while (b !== 0n) {
    const temp = b
    b = a % b
    a = temp
  }
  return a
}

export function createFraction(numerator: bigint, denominator: bigint): Fraction {
  if (denominator === 0n) {
    throw new Error('Denominator cannot be zero')
  }

  const sign = (numerator < 0n) !== (denominator < 0n) ? -1n : 1n
  const absNum = numerator < 0n ? -numerator : numerator
  const absDen = denominator < 0n ? -denominator : denominator
  const d = gcd(absNum, absDen)

  return {
    numerator: sign * (absNum / d),
    denominator: absDen / d,
  }
}

export function fractionFromInt(n: number): Fraction {
  return createFraction(BigInt(n), 1n)
}

export function add(a: Fraction, b: Fraction): Fraction {
  return createFraction(
    a.numerator * b.denominator + b.numerator * a.denominator,
    a.denominator * b.denominator
  )
}

export function subtract(a: Fraction, b: Fraction): Fraction {
  return createFraction(
    a.numerator * b.denominator - b.numerator * a.denominator,
    a.denominator * b.denominator
  )
}

export function multiply(a: Fraction, b: Fraction): Fraction {
  return createFraction(
    a.numerator * b.numerator,
    a.denominator * b.denominator
  )
}

export function divide(a: Fraction, b: Fraction): Fraction {
  if (b.numerator === 0n) {
    throw new Error('Cannot divide by zero fraction')
  }
  return createFraction(
    a.numerator * b.denominator,
    a.denominator * b.numerator
  )
}

export function compare(a: Fraction, b: Fraction): -1 | 0 | 1 {
  const diff = subtract(a, b)
  if (diff.numerator === 0n) return 0
  return diff.numerator > 0n ? 1 : -1
}

export function greaterThan(a: Fraction, b: Fraction): boolean {
  return compare(a, b) === 1
}

export function lessThan(a: Fraction, b: Fraction): boolean {
  return compare(a, b) === -1
}

export function equals(a: Fraction, b: Fraction): boolean {
  return compare(a, b) === 0
}

export function toNumber(f: Fraction): number {
  return Number(f.numerator) / Number(f.denominator)
}

export function toString(f: Fraction): string {
  if (f.denominator === 1n) {
    return f.numerator.toString()
  }
  return `${f.numerator}/${f.denominator}`
}

export const ZERO = createFraction(0n, 1n)
export const ONE = createFraction(1n, 1n)
export const HALF = createFraction(1n, 2n)
export const THIRD = createFraction(1n, 3n)
export const QUARTER = createFraction(1n, 4n)
export const SIXTH = createFraction(1n, 6n)
export const EIGHTH = createFraction(1n, 8n)
