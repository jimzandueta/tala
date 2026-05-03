import { getHistogram } from '../../../src/indicators/trend/histogram'
import { getMACD } from '../../../src/indicators/trend/macd'
import { makeLinearHistory } from '../../fixtures'

describe('getHistogram', () => {
  const periods = { fastPeriod: 12, slowPeriod: 26, signalLength: 9 }

  it('returns the same array', () => {
    const hist = makeLinearHistory(60)
    getMACD(hist, periods, { includeSignal: true })
    expect(getHistogram(hist, periods)).toBe(hist)
  })

  it('sets histogram key on entries', () => {
    const hist = makeLinearHistory(60)
    getHistogram(hist, periods)
    expect(typeof hist[0].histogram).toBe('number')
  })

  it('histogram = macd - signal', () => {
    const hist = makeLinearHistory(60)
    getMACD(hist, periods, { includeSignal: true, includeHistogram: true })
    const macd = hist[0].macd as number
    const signal = hist[0].signal as number
    const histogram = hist[0].histogram as number
    expect(histogram).toBeCloseTo(macd - signal, 4)
  })

  it('computes without pre-computed macd and signal (auto-computes internally)', () => {
    const hist = makeLinearHistory(60)
    getHistogram(hist, periods)
    expect(typeof hist[0].histogram).toBe('number')
    expect(isFinite(hist[0].histogram as number)).toBe(true)
  })

  it('histogram is zero when macd equals signal', () => {
    // Use a constant-price history so macd converges to 0 and signal converges to 0
    const hist = makeLinearHistory(60, 100, 0)
    getMACD(hist, periods, { includeSignal: true, includeHistogram: true })
    // histogram should be very close to 0 (both macd and signal ~0 for flat prices)
    expect(Math.abs(hist[0].histogram as number)).toBeCloseTo(0, 4)
  })
})
