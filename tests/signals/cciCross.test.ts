import { getCCICross } from '../../src/signals/cciCross'
import { getCCI } from '../../src/indicators/momentum/cci'
import { makeLinearHistory, makeOscillatingHistory } from '../fixtures'

describe('getCCICross', () => {
  it('returns an array', () => {
    const hist = makeLinearHistory(60)
    const result = getCCICross(hist)
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns fewer or equal entries than input', () => {
    const hist = makeLinearHistory(60)
    const result = getCCICross(hist)
    expect(result.length).toBeLessThanOrEqual(hist.length)
  })

  it('each returned entry has a days property that is a number', () => {
    const hist = makeLinearHistory(60)
    const result = getCCICross(hist)
    result.forEach(entry => {
      expect(typeof entry.days).toBe('number')
    })
  })

  it('each returned entry is a valid PriceHistoryEntry with open/high/low/close', () => {
    const hist = makeLinearHistory(60)
    const result = getCCICross(hist)
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
    getCCICross(hist)
    expect(hist.length).toBe(originalLength)
  })

  it('returns cross entries when CCI crosses the limit', () => {
    const hist = makeOscillatingHistory(200, 80, 25)
    getCCI(hist)
    const result = getCCICross(hist)
    expect(result.length).toBeGreaterThan(0)
    result.forEach(entry => {
      expect(typeof entry.days).toBe('number')
    })
  })
})
