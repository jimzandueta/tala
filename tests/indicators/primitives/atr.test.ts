import { getATR } from '../../../src/indicators/primitives/atr'
import { getADX } from '../../../src/indicators/momentum/adx'
import { makeLinearHistory } from '../../fixtures'

describe('getATR', () => {
  it('returns the same array (mutates in place)', () => {
    const hist = makeLinearHistory(20)
    expect(getATR(hist, 14)).toBe(hist)
  })

  it('produces the same atr values as getADX for the same input', () => {
    const hist1 = makeLinearHistory(30)
    const hist2 = makeLinearHistory(30)
    getATR(hist1, 14)
    getADX(hist2, 14)
    for (let i = 0; i < 30; i++) {
      expect(hist1[i].atr14).toBeCloseTo(hist2[i].atr14 as number, 6)
    }
  })

  it('tail entries are 0', () => {
    const hist = makeLinearHistory(20)
    getATR(hist, 14)
    for (let i = 7; i < 20; i++) {
      expect(hist[i].atr14).toBe(0)
    }
  })

  it('all valid ATR values are positive for a non-flat series', () => {
    const hist = makeLinearHistory(30)
    getATR(hist, 14)
    for (let i = 0; i <= 16; i++) {
      expect(hist[i].atr14 as number).toBeGreaterThanOrEqual(0)
    }
  })

  it('ATR is higher for a volatile series than a calm one', () => {
    const calm = makeLinearHistory(30, 100, 1)
    const volatile_ = makeLinearHistory(30, 100, 5)
    getATR(calm, 14)
    getATR(volatile_, 14)
    expect(volatile_[0].atr14 as number).toBeGreaterThan(calm[0].atr14 as number)
  })

  it('writes tr key onto entries', () => {
    const hist = makeLinearHistory(20)
    getATR(hist, 14)
    expect(hist[0].tr).toBeDefined()
  })

  it('supports custom period', () => {
    const hist = makeLinearHistory(30)
    getATR(hist, 7)
    expect(hist[0].atr7).toBeDefined()
    expect(hist[24].atr7).toBe(0)
  })
})
