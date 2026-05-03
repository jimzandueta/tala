import { getDM } from '../../../src/indicators/primitives/dm'
import { PriceHistoryEntry } from '../../../src/types'

describe('getDM', () => {
  it('returns the same array', () => {
    const hist: PriceHistoryEntry[] = [
      { open: 10, high: 12, low: 8, close: 10 },
      { open: 9, high: 10, low: 7, close: 9 },
    ]
    expect(getDM(hist)).toBe(hist)
  })

  it('sets dmp and dmn keys on all entries', () => {
    const hist: PriceHistoryEntry[] = [
      { open: 10, high: 12, low: 8, close: 10 },
      { open: 9, high: 10, low: 7, close: 9 },
    ]
    getDM(hist)
    expect(hist[0].dmp).toBeDefined()
    expect(hist[0].dmn).toBeDefined()
    expect(hist[1].dmp).toBeDefined()
    expect(hist[1].dmn).toBeDefined()
  })

  it('strong upward candle: dmp > 0 and dmn = 0', () => {
    // index 0 (most recent): high=20 > high[1]=10 → dmp=10
    // low[1]=9, low[0]=18 → dmn = 9 - 18 = -9 (negative, loses to dmp)
    // Since dmp(10) > dmn(-9), but dmn is already negative so both negative? No:
    // dmp=10, dmn=-9 → dmp > 0 and dmn < 0: they aren't both negative,
    // dmp(10) > dmn(-9) so dmn = 0
    const hist: PriceHistoryEntry[] = [
      { open: 19, high: 20, low: 18, close: 19 },
      { open: 9, high: 10, low: 9, close: 9 },
    ]
    getDM(hist)
    expect(hist[0].dmp).toBeGreaterThan(0)
    expect(hist[0].dmn).toBe(0)
  })

  it('strong downward candle: dmn > 0 and dmp = 0', () => {
    // index 0 (most recent): high=10, high[1]=20 → dmp = 10-20 = -10
    // low[1]=18, low[0]=8 → dmn = 18-8 = 10
    // dmp(-10) < dmn(10) → dmp = 0
    const hist: PriceHistoryEntry[] = [
      { open: 9, high: 10, low: 8, close: 9 },
      { open: 19, high: 20, low: 18, close: 19 },
    ]
    getDM(hist)
    expect(hist[0].dmn).toBeGreaterThan(0)
    expect(hist[0].dmp).toBe(0)
  })

  it('oldest candle (last index) has dmp = high and dmn = -low (prevHigh/prevLow = 0)', () => {
    // For the oldest candle (i = length-1), prevHigh=0 and prevLow=0
    // dmp = high[i] - 0 = high[i]
    // dmn = 0 - low[i] = -low[i] (negative)
    // Since dmp > 0 and dmn < 0: dmp > dmn, so dmn = 0
    const hist: PriceHistoryEntry[] = [
      { open: 10, high: 12, low: 8, close: 10 },
      { open: 9, high: 11, low: 7, close: 9 },
    ]
    getDM(hist)
    // oldest entry (index 1): dmp = 11 - 0 = 11, dmn = 0 - 7 = -7 → dmp wins
    expect(hist[1].dmp).toBe(11)
    expect(hist[1].dmn).toBe(0)
  })

  it('sideways candle where both movements are zero or equal: both set to 0', () => {
    // identical candles: dmp = high-high = 0, dmn = low-low = 0 → both zero (equal case)
    const hist: PriceHistoryEntry[] = [
      { open: 10, high: 12, low: 8, close: 10 },
      { open: 10, high: 12, low: 8, close: 10 },
    ]
    getDM(hist)
    expect(hist[0].dmp).toBe(0)
    expect(hist[0].dmn).toBe(0)
  })
})
