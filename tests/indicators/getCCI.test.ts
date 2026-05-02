import { getCCI } from '../../src/indicators/getCCI'
import { makeHistory } from '../fixtures'

describe('getCCI', () => {
  it('returns the same array', () => {
    const hist = makeHistory(Array(30).fill(10))
    expect(getCCI(hist)).toBe(hist)
  })

  it('sets cci on entries with enough data', () => {
    const hist = makeHistory(Array.from({ length: 30 }, (_, i) => 100 - i * 0.5))
    getCCI(hist)
    expect(typeof hist[0].cci).toBe('number')
  })

  it('cci is a finite number for varying prices', () => {
    const hist = makeHistory(Array.from({ length: 30 }, (_, i) => 100 - i * 0.5))
    getCCI(hist)
    expect(isFinite(hist[0].cci as number)).toBe(true)
  })

  it('supports custom period', () => {
    const hist = makeHistory(Array.from({ length: 30 }, (_, i) => 100 - i * 0.5))
    getCCI(hist, 10)
    expect(typeof hist[0].cci).toBe('number')
  })

  it('sets cci = 0 for candles with insufficient history', () => {
    const hist = makeHistory(Array.from({ length: 30 }, (_, i) => 100 - i * 0.5))
    getCCI(hist)
    // Candles near the tail (oldest) have insufficient data and default to 0
    expect(hist[hist.length - 1].cci).toBe(0)
  })

  it('computes correct CCI for known input (period=3)', () => {
    // closes [12, 10, 8] → high = close+1, low = close-1
    // TP[0] = (13+11+12)/3 = 12, TP[1] = (11+9+10)/3 = 10, TP[2] = (9+7+8)/3 = 8
    // SMA3(TP) at index 0 = (12+10+8)/3 = 10
    // MeanDeviation = (|12-10| + |10-10| + |8-10|) / 3 = (2+0+2)/3 = 4/3 ≈ 1.333
    // CCI = (12-10) / (0.015 * 1.333) ≈ 2 / 0.02 = 100
    const hist = makeHistory([12, 10, 8])
    getCCI(hist, 3)
    expect(hist[0].cci).toBeCloseTo(100, 0)
  })
})
