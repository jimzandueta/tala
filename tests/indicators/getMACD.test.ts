import { getMACD } from '../../src/indicators/getMACD'
import { makeLinearHistory } from '../fixtures'

describe('getMACD', () => {
  const periods = { fastPeriod: 12, slowPeriod: 26, signalLength: 9 }

  it('returns the same array', () => {
    const hist = makeLinearHistory(60)
    expect(getMACD(hist, periods, {})).toBe(hist)
  })

  it('sets macd key on candles with enough data', () => {
    const hist = makeLinearHistory(60)
    getMACD(hist, periods, {})
    expect(typeof hist[0].macd).toBe('number')
  })

  it('sets signal key when includeSignal: true', () => {
    const hist = makeLinearHistory(60)
    getMACD(hist, periods, { includeSignal: true })
    expect(typeof hist[0].signal).toBe('number')
  })

  it('sets histogram key when includeHistogram: true', () => {
    const hist = makeLinearHistory(60)
    getMACD(hist, periods, { includeHistogram: true })
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

  it('cleans up ema keys it created internally', () => {
    const hist = makeLinearHistory(60)
    getMACD(hist, periods, {})
    hist.forEach(h => {
      expect(h.ema12).toBeUndefined()
      expect(h.ema26).toBeUndefined()
    })
  })
})
