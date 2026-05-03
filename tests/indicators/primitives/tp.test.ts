import { getTP } from '../../../src/indicators/primitives/tp'
import { PriceHistoryEntry } from '../../../src/types'

describe('getTP', () => {
  it('returns the same array', () => {
    const hist: PriceHistoryEntry[] = [{ open: 10, high: 12, low: 8, close: 10 }]
    expect(getTP(hist)).toBe(hist)
  })

  it('computes (high + low + close) / 3', () => {
    const hist: PriceHistoryEntry[] = [{ open: 10, high: 12, low: 8, close: 10 }]
    getTP(hist)
    expect(hist[0].tp).toBeCloseTo(10, 5)
  })

  it('handles multiple entries', () => {
    const hist: PriceHistoryEntry[] = [
      { open: 10, high: 15, low: 5, close: 10 },
      { open: 20, high: 30, low: 10, close: 20 },
    ]
    getTP(hist)
    expect(hist[0].tp).toBeCloseTo((15 + 5 + 10) / 3, 5)
    expect(hist[1].tp).toBeCloseTo((30 + 10 + 20) / 3, 5)
  })
})
