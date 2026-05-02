import { getWEMA } from '../../src/indicators/getWEMA'
import { makeHistory } from '../fixtures'

describe('getWEMA', () => {
  it('returns the same array', () => {
    const hist = makeHistory(Array(20).fill(10))
    expect(getWEMA(hist, 5, 0)).toBe(hist)
  })

  it('converges to price for uniform input', () => {
    const hist = makeHistory(Array(30).fill(10))
    getWEMA(hist, 5, 0)
    expect(hist[0].wema5).toBeCloseTo(10, 3)
  })

  it('sets 0 for entries without enough history', () => {
    const hist = makeHistory(Array(10).fill(10))
    getWEMA(hist, 5, 0)
    expect(hist[9].wema5).toBe(0)
  })
})
