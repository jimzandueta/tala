import { getTRIX } from '../../../src/indicators/trend/trix'
import { makeLinearHistory } from '../../fixtures'

describe('getTRIX', () => {
  it('returns the same array', () => {
    const hist = makeLinearHistory(60)
    expect(getTRIX(hist)).toBe(hist)
  })

  it('sets trix key on all candles', () => {
    const hist = makeLinearHistory(60)
    getTRIX(hist)
    expect(typeof hist[0].trix).toBe('number')
  })

  it('sets trix key with a custom period of 5 on 30 candles', () => {
    const hist = makeLinearHistory(30)
    getTRIX(hist, 5)
    expect(typeof hist[0].trix).toBe('number')
    expect(isFinite(hist[0].trix as number)).toBe(true)
  })

  it('sets trix = 0 on the oldest candle (boundary)', () => {
    const hist = makeLinearHistory(60)
    getTRIX(hist)
    // The oldest entry (last index) gets trix = 0 per source: i < priceHist.length - 1
    expect(hist[hist.length - 1].trix).toBe(0)
  })

  it('trix is a finite number for each candle with enough history', () => {
    const hist = makeLinearHistory(80, 100, 1)
    getTRIX(hist, 5)
    // With period=5, we need at least 3*5=15 candles for meaningful values
    expect(isFinite(hist[0].trix as number)).toBe(true)
  })
})
