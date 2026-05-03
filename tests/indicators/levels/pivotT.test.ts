import { getPivotT } from '../../../src/indicators/levels/pivotT'
import { makeLinearHistory } from '../../fixtures'

describe('getPivotT', () => {
  // With period=20, the condition i < length - 2*period means we need length > 2*period.
  // For keys to be written we need at least 3*period entries (60 for period=20).
  // Using 80 entries to be safe.
  const period = 20

  it('returns the same array (mutates in place)', () => {
    const hist = makeLinearHistory(80, 100, 1)
    expect(getPivotT(hist, period)).toBe(hist)
  })

  it('sets pp20 on entries in the first pivot window', () => {
    const hist = makeLinearHistory(80, 100, 1)
    getPivotT(hist, period)
    // First window i=0: entries 0..19 should have pp20 set
    for (let j = 0; j < period; j++) {
      expect(hist[j]).toHaveProperty('pp20')
      expect(typeof hist[j].pp20).toBe('number')
    }
  })

  it('sets r120, s120, r220, s220 on entries in the first pivot window', () => {
    const hist = makeLinearHistory(80, 100, 1)
    getPivotT(hist, period)
    for (let j = 0; j < period; j++) {
      expect(hist[j]).toHaveProperty('r120')
      expect(hist[j]).toHaveProperty('s120')
      expect(hist[j]).toHaveProperty('r220')
      expect(hist[j]).toHaveProperty('s220')
    }
  })

  it('resistance r120 is above pivot pp20', () => {
    const hist = makeLinearHistory(80, 100, 1)
    getPivotT(hist, period)
    for (let j = 0; j < period; j++) {
      expect(hist[j].r120 as number).toBeGreaterThan(hist[j].pp20 as number)
    }
  })

  it('support s120 is below pivot pp20', () => {
    const hist = makeLinearHistory(80, 100, 1)
    getPivotT(hist, period)
    for (let j = 0; j < period; j++) {
      expect(hist[j].s120 as number).toBeLessThan(hist[j].pp20 as number)
    }
  })

  it('relationship: r120 > pp20 > s120', () => {
    const hist = makeLinearHistory(80, 100, 1)
    getPivotT(hist, period)
    for (let j = 0; j < period; j++) {
      const r1 = hist[j].r120 as number
      const pp = hist[j].pp20 as number
      const s1 = hist[j].s120 as number
      expect(r1).toBeGreaterThan(pp)
      expect(pp).toBeGreaterThan(s1)
    }
  })

  it('r220 >= r120 and s220 <= s120', () => {
    const hist = makeLinearHistory(80, 100, 1)
    getPivotT(hist, period)
    for (let j = 0; j < period; j++) {
      expect(hist[j].r220 as number).toBeGreaterThanOrEqual(hist[j].r120 as number)
      expect(hist[j].s220 as number).toBeLessThanOrEqual(hist[j].s120 as number)
    }
  })

  it('all entries in second window also have pivot keys', () => {
    const hist = makeLinearHistory(80, 100, 1)
    getPivotT(hist, period)
    // Second window i=20: entries 20..39 should also have pp20 set
    for (let j = period; j < 2 * period; j++) {
      expect(hist[j]).toHaveProperty('pp20')
    }
  })
})
