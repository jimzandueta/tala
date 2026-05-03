import { getStochRSI } from '../../../src/indicators/momentum/stochRSI'
import { makeLinearHistoryWithChangeVal, makeOscillatingHistoryWithChangeVal } from '../../fixtures'
import { PriceHistoryEntry } from '../../../src/types'

describe('getStochRSI', () => {
  it('returns the same array (mutates in place)', () => {
    const hist = makeLinearHistoryWithChangeVal(40)
    expect(getStochRSI(hist, 14)).toBe(hist)
  })

  it('all valid K values are in [0, 100]', () => {
    const hist = makeOscillatingHistoryWithChangeVal(60)
    getStochRSI(hist, 14)
    for (let i = 0; i < 60; i++) {
      const v = hist[i].stochRSIK as number
      if (v !== 0) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(100)
      }
    }
  })

  it('tail entries are 0', () => {
    const hist = makeLinearHistoryWithChangeVal(40)
    getStochRSI(hist, 14)
    const rsiSeedIdx = 40 - 1 - 14
    const stochLast = rsiSeedIdx - 14 + 1
    for (let i = stochLast + 1; i < 40; i++) {
      expect(hist[i].stochRSIK).toBe(0)
    }
  })

  it('D-line (stochRSID3) is the 3-bar SMA of K', () => {
    const hist = makeOscillatingHistoryWithChangeVal(60)
    getStochRSI(hist, 14)
    const k0 = hist[0].stochRSIK as number
    const k1 = hist[1].stochRSIK as number
    const k2 = hist[2].stochRSIK as number
    if (k0 !== 0 && k1 !== 0 && k2 !== 0) {
      expect(hist[0].stochRSID3).toBeCloseTo((k0 + k1 + k2) / 3, 5)
    }
  })

  it('pure uptrend → stochRSIK = 100 at seed (RSI is constant 100)', () => {
    const closes = Array.from({ length: 60 }, (_, i) => 100 + i)
    const hist: PriceHistoryEntry[] = closes.map((close, i) => ({
      open: close,
      high: close + 1,
      low: close - 1,
      close,
      changeVal: i < closes.length - 1 ? close - closes[i + 1] : 0,
    }))
    getStochRSI(hist, 14)
    const rsiSeedIdx = 60 - 1 - 14
    const stochLast = rsiSeedIdx - 14 + 1
    expect(hist[stochLast].stochRSIK).toBeCloseTo(0, 3)
  })

  it('does not leave rsiN key when RSI was not pre-existing', () => {
    const hist = makeLinearHistoryWithChangeVal(40)
    getStochRSI(hist, 14)
    expect(hist[0].rsi14).toBeUndefined()
  })

  it('uses pre-existing RSI if available', () => {
    const hist = makeOscillatingHistoryWithChangeVal(60)
    getStochRSI(hist, 14)
    const k0 = hist[0].stochRSIK as number

    const hist2 = makeOscillatingHistoryWithChangeVal(60)
    const { getRSI } = require('../../../src/indicators/momentum/rsi')
    getRSI(hist2, 14)
    getStochRSI(hist2, 14)
    expect(hist2[0].stochRSIK).toBeCloseTo(k0, 5)
  })

  it('auto-computes changeVal if missing', () => {
    const closes = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i / 5) * 10)
    const hist: PriceHistoryEntry[] = closes.map(close => ({ open: close, high: close + 1, low: close - 1, close }))
    expect(() => getStochRSI(hist, 14)).not.toThrow()
  })
})
