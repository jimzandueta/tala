import { getALMA } from '../../../src/indicators/trend/alma'
import { makeHistory } from '../../fixtures'

describe('getALMA', () => {
  it('returns the same array', () => {
    const hist = makeHistory(Array(20).fill(10))
    expect(getALMA(hist)).toBe(hist)
  })

  it('sets alma key on candles with enough history', () => {
    const hist = makeHistory(Array(20).fill(10))
    getALMA(hist)
    expect(typeof hist[0].alma).toBe('number')
  })

  it('converges near price for uniform input', () => {
    const hist = makeHistory(Array(20).fill(10))
    getALMA(hist)
    expect(hist[0].alma).toBeCloseTo(10, 3)
  })

  it('sets alma = 0 for candles with insufficient history', () => {
    const hist = makeHistory(Array(20).fill(10))
    getALMA(hist)
    // The oldest candle does not have enough history: i + period >= priceHist.length → alma = 0
    expect(hist[hist.length - 1].alma).toBe(0)
  })

  it('alma is a finite number for varying prices', () => {
    const hist = makeHistory(Array.from({ length: 20 }, (_, i) => 100 - i * 0.5))
    getALMA(hist)
    expect(isFinite(hist[0].alma as number)).toBe(true)
  })
})
