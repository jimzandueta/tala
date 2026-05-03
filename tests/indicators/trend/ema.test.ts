import { getEMA } from '../../../src/indicators/trend/ema'
import { makeHistory } from '../../fixtures'

describe('getEMA', () => {
  it('returns the same array', () => {
    const hist = makeHistory(Array(10).fill(10))
    expect(getEMA(hist, 5)).toBe(hist)
  })

  it('converges to price for uniform input', () => {
    const hist = makeHistory(Array(20).fill(10))
    getEMA(hist, 5)
    expect(hist[0].ema5).toBeCloseTo(10, 4)
    expect(hist[5].ema5).toBeCloseTo(10, 4)
  })

  it('cleans up intermediate sma key when it computed it', () => {
    const hist = makeHistory(Array(10).fill(10))
    getEMA(hist, 5)
    expect(hist[0].sma5).toBeUndefined()
  })

  it('does not delete sma key if it was already present', () => {
    const hist = makeHistory(Array(10).fill(10))
    hist.forEach(h => { h.sma5 = 10 })
    getEMA(hist, 5)
    expect(hist[0].sma5).toBe(10)
  })

  it('fills leading entries with 0', () => {
    const hist = makeHistory(Array(10).fill(10))
    getEMA(hist, 5)
    expect(hist[9].ema5).toBe(0)
  })
})
