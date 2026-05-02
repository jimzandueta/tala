import { getFibRL } from '../../src/indicators/getFibRL'
import { getPivotT } from '../../src/indicators/getPivotT'
import { makeLinearHistory } from '../fixtures'

describe('getFibRL', () => {
  // getFibRL internally calls getPivotT, then adds fibonacci retracement levels.
  // Fibonacci ratios used: [0.236, 0.382, 0.5, 0.618, 0.786]
  // Keys written: fib0.236, fib0.382, fib0.5, fib0.618, fib0.786
  // Condition: i < priceHist.length - period (entries that have s2/r2 from getPivotT)
  const period = 20
  const fibRatios = [0.236, 0.382, 0.5, 0.618, 0.786]

  it('returns the same array (mutates in place)', () => {
    const hist = makeLinearHistory(80)
    expect(getFibRL(hist, period)).toBe(hist)
  })

  it('sets fibonacci retracement keys on entries with pivot data', () => {
    const hist = makeLinearHistory(80)
    getFibRL(hist, period)
    // Entries 0..39 should have all fib keys (they have s2/r2 from getPivotT and i < 80-20=60)
    // Use hasOwnProperty since Jest's toHaveProperty interprets dots as nested paths
    for (const r of fibRatios) {
      expect(Object.prototype.hasOwnProperty.call(hist[0], `fib${r}`)).toBe(true)
      expect(typeof hist[0][`fib${r}`]).toBe('number')
    }
  })

  it('sets all 5 fibonacci level keys: fib0.236, fib0.382, fib0.5, fib0.618, fib0.786', () => {
    const hist = makeLinearHistory(80)
    getFibRL(hist, period)
    for (const r of fibRatios) {
      expect(Object.prototype.hasOwnProperty.call(hist[0], `fib${r}`)).toBe(true)
    }
  })

  it('fibonacci levels are ordered correctly (fib0.236 highest, fib0.786 lowest for downtrend)', () => {
    const hist = makeLinearHistory(80)
    getFibRL(hist, period)
    // Formula: p2 - |p2-p1| * r, where p2=r2 (resistance), p1=s2 (support)
    // Higher r => lower fib level (deeper retracement)
    const fib236 = hist[0]['fib0.236'] as number
    const fib382 = hist[0]['fib0.382'] as number
    const fib500 = hist[0]['fib0.5'] as number
    const fib618 = hist[0]['fib0.618'] as number
    const fib786 = hist[0]['fib0.786'] as number
    expect(fib236).toBeGreaterThan(fib382)
    expect(fib382).toBeGreaterThan(fib500)
    expect(fib500).toBeGreaterThan(fib618)
    expect(fib618).toBeGreaterThan(fib786)
  })

  it('fibonacci levels are finite numbers', () => {
    const hist = makeLinearHistory(80)
    getFibRL(hist, period)
    for (const r of fibRatios) {
      expect(isFinite(hist[0][`fib${r}`] as number)).toBe(true)
    }
  })

  it('fib0.5 equals the midpoint between r220 and s220', () => {
    const hist = makeLinearHistory(80)
    getPivotT(hist, 20)
    getFibRL(hist, 20)
    const r2 = hist[0].r220 as number
    const s2 = hist[0].s220 as number
    const expectedMidpoint = r2 - (Math.abs(r2 - s2) * 0.5)
    expect(hist[0]['fib0.5']).toBeCloseTo(expectedMidpoint, 5)
  })
})
