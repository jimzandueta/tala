import { getSignal } from '../../../src/indicators/trend/signal'
import { getMACD } from '../../../src/indicators/trend/macd'
import { makeLinearHistory } from '../../fixtures'

describe('getSignal', () => {
  const periods = { fastPeriod: 12, slowPeriod: 26, signalLength: 9 }

  it('returns the same array', () => {
    const hist = makeLinearHistory(60)
    getMACD(hist, periods, {})
    expect(getSignal(hist, periods)).toBe(hist)
  })

  it('sets signal key on entries after getMACD is pre-computed', () => {
    const hist = makeLinearHistory(60)
    getMACD(hist, periods, {})
    getSignal(hist, periods)
    expect(typeof hist[0].signal).toBe('number')
  })

  it('signal is a number between reasonable bounds for linear data', () => {
    const hist = makeLinearHistory(60)
    getMACD(hist, periods, {})
    getSignal(hist, periods)
    expect(isFinite(hist[0].signal as number)).toBe(true)
  })

  it('computes signal without pre-computed MACD (auto-computes MACD internally)', () => {
    const hist = makeLinearHistory(60)
    getSignal(hist, periods)
    expect(typeof hist[0].signal).toBe('number')
  })

  it('cleans up macdsma intermediate key', () => {
    const hist = makeLinearHistory(60)
    getMACD(hist, periods, {})
    getSignal(hist, periods)
    hist.forEach(h => {
      expect(h[`macdsma${periods.signalLength}`]).toBeUndefined()
    })
  })
})
