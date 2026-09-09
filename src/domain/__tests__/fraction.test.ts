import { describe, test, expect } from 'bun:test'
import {
  createFraction,
  fractionFromInt,
  add,
  subtract,
  multiply,
  divide,
  compare,
  greaterThan,
  lessThan,
  equals,
  toNumber,
  toString as fractionToString,
  ZERO,
  ONE,
  HALF,
  THIRD,
  QUARTER,
  SIXTH,
  EIGHTH,
} from '../fraction'

describe('createFraction', () => {
  test('creates simplified fraction', () => {
    const f = createFraction(4n, 8n)
    expect(f.numerator).toBe(1n)
    expect(f.denominator).toBe(2n)
  })

  test('handles negative numerator', () => {
    const f = createFraction(-1n, 2n)
    expect(f.numerator).toBe(-1n)
    expect(f.denominator).toBe(2n)
  })

  test('handles negative denominator', () => {
    const f = createFraction(1n, -2n)
    expect(f.numerator).toBe(-1n)
    expect(f.denominator).toBe(2n)
  })

  test('throws on zero denominator', () => {
    expect(() => createFraction(1n, 0n)).toThrow('Denominator cannot be zero')
  })
})

describe('fractionFromInt', () => {
  test('creates integer fraction', () => {
    const f = fractionFromInt(5)
    expect(f.numerator).toBe(5n)
    expect(f.denominator).toBe(1n)
  })
})

describe('arithmetic', () => {
  test('add: 1/2 + 1/3 = 5/6', () => {
    const result = add(HALF, THIRD)
    expect(result.numerator).toBe(5n)
    expect(result.denominator).toBe(6n)
  })

  test('subtract: 1/2 - 1/4 = 1/4', () => {
    const result = subtract(HALF, QUARTER)
    expect(equals(result, QUARTER)).toBe(true)
  })

  test('multiply: 1/2 * 1/3 = 1/6', () => {
    const result = multiply(HALF, THIRD)
    expect(equals(result, SIXTH)).toBe(true)
  })

  test('divide: 1/2 / 1/4 = 2', () => {
    const result = divide(HALF, QUARTER)
    expect(equals(result, fractionFromInt(2))).toBe(true)
  })

  test('divide by zero throws', () => {
    expect(() => divide(HALF, ZERO)).toThrow('Cannot divide by zero fraction')
  })
})

describe('comparison', () => {
  test('1/2 > 1/3', () => {
    expect(greaterThan(HALF, THIRD)).toBe(true)
  })

  test('1/3 < 1/2', () => {
    expect(lessThan(THIRD, HALF)).toBe(true)
  })

  test('1/2 == 2/4', () => {
    expect(equals(HALF, createFraction(2n, 4n))).toBe(true)
  })

  test('compare returns 0 for equal', () => {
    expect(compare(HALF, createFraction(2n, 4n))).toBe(0)
  })
})

describe('conversion', () => {
  test('toNumber', () => {
    expect(toNumber(HALF)).toBe(0.5)
    expect(toNumber(THIRD)).toBeCloseTo(0.333333, 5)
  })

  test('toString', () => {
    expect(fractionToString(HALF)).toBe('1/2')
    expect(fractionToString(fractionFromInt(5))).toBe('5')
  })
})

describe('constants', () => {
  test('ZERO is 0/1', () => {
    expect(ZERO.numerator).toBe(0n)
    expect(ZERO.denominator).toBe(1n)
  })

  test('ONE is 1/1', () => {
    expect(ONE.numerator).toBe(1n)
    expect(ONE.denominator).toBe(1n)
  })

  test('HALF is 1/2', () => {
    expect(HALF.numerator).toBe(1n)
    expect(HALF.denominator).toBe(2n)
  })

  test('THIRD is 1/3', () => {
    expect(THIRD.numerator).toBe(1n)
    expect(THIRD.denominator).toBe(3n)
  })

  test('QUARTER is 1/4', () => {
    expect(QUARTER.numerator).toBe(1n)
    expect(QUARTER.denominator).toBe(4n)
  })

  test('SIXTH is 1/6', () => {
    expect(SIXTH.numerator).toBe(1n)
    expect(SIXTH.denominator).toBe(6n)
  })

  test('EIGHTH is 1/8', () => {
    expect(EIGHTH.numerator).toBe(1n)
    expect(EIGHTH.denominator).toBe(8n)
  })
})

describe('inheritance use cases', () => {
  test('1/6 + 1/4 + 7/12 = 1', () => {
    const result = add(add(SIXTH, QUARTER), createFraction(7n, 12n))
    expect(equals(result, ONE)).toBe(true)
  })

  test('1/8 + 1/4 + 5/8 = 1', () => {
    const result = add(add(EIGHTH, QUARTER), createFraction(5n, 8n))
    expect(equals(result, ONE)).toBe(true)
  })

  test('suami gets 1/4 when pewaris has children', () => {
    const suamiShare = QUARTER
    const anakShare = createFraction(3n, 4n)
    const total = add(suamiShare, anakShare)
    expect(equals(total, ONE)).toBe(true)
  })

  test('istri gets 1/8 when pewaris has children', () => {
    const istriShare = EIGHTH
    const anakShare = createFraction(7n, 8n)
    const total = add(istriShare, anakShare)
    expect(equals(total, ONE)).toBe(true)
  })
})
