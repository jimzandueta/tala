import { getADX } from '../../src/indicators/getADX'
import { makeLinearHistory } from '../fixtures'

describe('getADX', () => {
  it('returns the same array', () => {
    const hist = makeLinearHistory(60)
    expect(getADX(hist)).toBe(hist)
  })

  it('sets adx14 on candles with enough history', () => {
    const hist = makeLinearHistory(60)
    getADX(hist)
    expect(typeof hist[0].adx14).toBe('number')
  })

  it('adx14 is between 0 and 100', () => {
    const hist = makeLinearHistory(60)
    getADX(hist)
    const adx = hist[0].adx14 as number
    expect(adx).toBeGreaterThanOrEqual(0)
    expect(adx).toBeLessThanOrEqual(100)
  })

  it('removes internal working keys (tr14, dmn14, dmp14, dx14)', () => {
    const hist = makeLinearHistory(60)
    getADX(hist)
    hist.forEach(h => {
      expect(h.tr14).toBeUndefined()
      expect(h.dmn14).toBeUndefined()
      expect(h.dmp14).toBeUndefined()
      expect(h.dx14).toBeUndefined()
    })
  })

  it('retains sub-indicator keys (atr14, dmpS14, dmnS14) for caller use', () => {
    const hist = makeLinearHistory(60)
    getADX(hist)
    // atr14, dmpS14, dmnS14 are retained — callers may use them
    const candle = hist[0]
    expect(candle.atr14).toBeDefined()
    expect(candle.dmpS14).toBeDefined()
    expect(candle.dmnS14).toBeDefined()
  })

  it('supports custom period', () => {
    const hist = makeLinearHistory(80)
    getADX(hist, 7)
    expect(typeof hist[0].adx7).toBe('number')
  })
})
