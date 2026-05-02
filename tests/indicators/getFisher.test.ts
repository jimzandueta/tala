import { getFisher } from '../../src/indicators/getFisher'
import { makeLinearHistory } from '../fixtures'

describe('getFisher', () => {
  it('returns the same array (mutates in place)', () => {
    const hist = makeLinearHistory(30)
    expect(getFisher(hist)).toBe(hist)
  })

  it('sets fisherTransform on entries', () => {
    const hist = makeLinearHistory(30)
    getFisher(hist)
    // The oldest entry (index length-1) is seeded to 0, all others should have fisherTransform defined
    for (let i = 0; i < hist.length; i++) {
      expect(hist[i]).toHaveProperty('fisherTransform')
      expect(typeof hist[i].fisherTransform).toBe('number')
    }
  })

  it('sets fisherSignal on entries (except oldest)', () => {
    const hist = makeLinearHistory(30)
    getFisher(hist)
    // fisherSignal is set on all except the oldest (last index) entry
    for (let i = 0; i < hist.length - 1; i++) {
      expect(hist[i]).toHaveProperty('fisherSignal')
      expect(typeof hist[i].fisherSignal).toBe('number')
    }
  })

  it('oldest candle (last entry) has fisherTransform = 0 (seed value)', () => {
    const hist = makeLinearHistory(30)
    getFisher(hist)
    expect(hist[hist.length - 1].fisherTransform).toBe(0)
  })

  it('fisherSignal at index i equals fisherTransform at index i+1', () => {
    const hist = makeLinearHistory(30)
    getFisher(hist)
    // By definition: priceHist[i][setKeys.s] = priceHist[i+1][setKeys.t]
    for (let i = 0; i < hist.length - 1; i++) {
      expect(hist[i].fisherSignal).toBe(hist[i + 1].fisherTransform)
    }
  })

  it('fisherTransform values are finite numbers', () => {
    const hist = makeLinearHistory(30)
    getFisher(hist)
    for (let i = 0; i < hist.length; i++) {
      expect(isFinite(hist[i].fisherTransform as number)).toBe(true)
    }
  })
})
