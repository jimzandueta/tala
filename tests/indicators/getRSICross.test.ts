import { getRSICross } from '../../src/indicators/getRSICross'
import { getRSI } from '../../src/indicators/getRSI'
import { makeLinearHistoryWithChangeVal, makeOscillatingHistoryWithChangeVal } from '../fixtures'

describe('getRSICross', () => {
  it('returns an array', () => {
    const hist = makeLinearHistoryWithChangeVal(40)
    const result = getRSICross(hist)
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns fewer or equal entries than input', () => {
    const hist = makeLinearHistoryWithChangeVal(40)
    const result = getRSICross(hist)
    expect(result.length).toBeLessThanOrEqual(hist.length)
  })

  it('each returned entry has a days property that is a number', () => {
    const hist = makeLinearHistoryWithChangeVal(40)
    const result = getRSICross(hist)
    result.forEach(entry => {
      expect(typeof entry.days).toBe('number')
    })
  })

  it('each returned entry is a valid PriceHistoryEntry with open/high/low/close', () => {
    const hist = makeLinearHistoryWithChangeVal(40)
    const result = getRSICross(hist)
    result.forEach(entry => {
      expect(typeof entry.open).toBe('number')
      expect(typeof entry.high).toBe('number')
      expect(typeof entry.low).toBe('number')
      expect(typeof entry.close).toBe('number')
    })
  })

  it('does not mutate original array length', () => {
    const hist = makeLinearHistoryWithChangeVal(40)
    const originalLength = hist.length
    getRSICross(hist)
    expect(hist.length).toBe(originalLength)
  })

  it('returns cross entries when RSI crosses the limits', () => {
    const hist = makeOscillatingHistoryWithChangeVal(120, 30, 20)
    getRSI(hist)
    const result = getRSICross(hist)
    expect(result.length).toBeGreaterThan(0)
    result.forEach(entry => {
      expect(typeof entry.days).toBe('number')
    })
  })
})
