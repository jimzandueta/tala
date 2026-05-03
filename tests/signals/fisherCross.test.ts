import { getFisherCross } from '../../src/signals/fisherCross'
import { makeLinearHistory } from '../fixtures'

describe('getFisherCross', () => {
  it('returns an array', () => {
    const hist = makeLinearHistory(60)
    const result = getFisherCross(hist)
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns fewer or equal entries than input', () => {
    const hist = makeLinearHistory(60)
    const result = getFisherCross(hist)
    expect(result.length).toBeLessThanOrEqual(hist.length)
  })

  it('each returned entry has a days property that is a number', () => {
    const hist = makeLinearHistory(60)
    const result = getFisherCross(hist)
    result.forEach(entry => {
      expect(typeof entry.days).toBe('number')
    })
  })

  it('each returned entry is a valid PriceHistoryEntry with open/high/low/close', () => {
    const hist = makeLinearHistory(60)
    const result = getFisherCross(hist)
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
    getFisherCross(hist)
    expect(hist.length).toBe(originalLength)
  })
})
