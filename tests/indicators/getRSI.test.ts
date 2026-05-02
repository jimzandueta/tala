import { getRSI } from '../../src/indicators/getRSI'
import { makeLinearHistoryWithChangeVal } from '../fixtures'

describe('getRSI', () => {
  it('returns the same array', () => {
    const hist = makeLinearHistoryWithChangeVal(30)
    expect(getRSI(hist)).toBe(hist)
  })

  it('sets rsi14 on candles with enough history', () => {
    const hist = makeLinearHistoryWithChangeVal(30)
    getRSI(hist)
    expect(typeof hist[0].rsi14).toBe('number')
    expect(hist[0].rsi14).toBeGreaterThanOrEqual(0)
    expect(hist[0].rsi14).toBeLessThanOrEqual(100)
  })

  it('sets rsi14 = 100 for an all-gain price series', () => {
    // makeLinearHistoryWithChangeVal: closes=[100,99,...], changeVal[i]=+1 (all gains), lAve=0 → 100/(1+Infinity)→0 → RSI=100
    const hist = makeLinearHistoryWithChangeVal(30, 100, 1)
    getRSI(hist)
    expect(hist[0].rsi14).toBe(100)
  })

  it('supports custom period', () => {
    const hist = makeLinearHistoryWithChangeVal(30)
    getRSI(hist, 7)
    expect(typeof hist[0].rsi7).toBe('number')
  })

  it('rsi is 0 for all-loss series (all closes decreasing with positive step)', () => {
    // makeLinearHistoryWithChangeVal with negative step: closes=[100,101,...], changeVal[i]=-1 (all losses), gAve=0 → RSI=0
    const hist = makeLinearHistoryWithChangeVal(30, 100, -1)
    getRSI(hist)
    expect(hist[0].rsi14).toBe(0)
  })
})
