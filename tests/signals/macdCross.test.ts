import { getMACDCross } from '../../src/signals/macdCross'
import { getMACD } from '../../src/indicators/trend/macd'
import { makeLinearHistory, makeOscillatingHistory } from '../fixtures'

describe('getMACDCross', () => {
  it('returns an array', () => {
    const hist = makeLinearHistory(60)
    const result = getMACDCross(hist)
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns fewer or equal entries than input', () => {
    const hist = makeLinearHistory(60)
    const result = getMACDCross(hist)
    expect(result.length).toBeLessThanOrEqual(hist.length)
  })

  it('each cross entry has a days property that is a number', () => {
    const hist = makeOscillatingHistory(120)
    getMACD(hist, { fastPeriod: 12, slowPeriod: 26, signalLength: 9 }, { includeSignal: true, includeHistogram: false })
    const result = getMACDCross(hist)
    expect(result.length).toBeGreaterThan(0)
    result.forEach(entry => {
      expect(typeof entry.days).toBe('number')
    })
  })

  it('each cross entry is a valid PriceHistoryEntry with open/high/low/close', () => {
    const hist = makeLinearHistory(60)
    const result = getMACDCross(hist)
    result.forEach(entry => {
      expect(typeof entry.open).toBe('number')
      expect(typeof entry.high).toBe('number')
      expect(typeof entry.low).toBe('number')
      expect(typeof entry.close).toBe('number')
    })
  })

  it('does not mutate original array length', () => {
    const hist = makeLinearHistory(60)
    const originalLength = hist.length
    getMACDCross(hist)
    expect(hist.length).toBe(originalLength)
  })
})
