import { getBB } from '../../../src/indicators/trend/bb'
import { getSMA } from '../../../src/indicators/trend/sma'
import { makeHistory, makeLinearHistory } from '../../fixtures'

describe('getBB', () => {
  it('returns the same array (mutates in place)', () => {
    const hist = makeLinearHistory(25)
    expect(getBB(hist, 20)).toBe(hist)
  })

  it('bbMid equals SMA for the same period', () => {
    const hist = makeLinearHistory(30)
    const histSMA = makeLinearHistory(30)
    getBB(hist, 20)
    getSMA(histSMA, 20)
    for (let i = 0; i <= 10; i++) {
      expect(hist[i].bbMid20).toBeCloseTo(histSMA[i].sma20 as number, 6)
    }
  })

  it('upper > mid > lower for a volatile series', () => {
    const hist = makeHistory([110, 90, 115, 85, 120, 80, 125, 75, 130, 70, 110, 90, 115, 85, 120, 80, 125, 75, 130, 70, 100])
    getBB(hist, 20)
    expect(hist[0].bbUpper20 as number).toBeGreaterThan(hist[0].bbMid20 as number)
    expect(hist[0].bbMid20 as number).toBeGreaterThan(hist[0].bbLower20 as number)
  })

  it('flat series: upper = lower = mid (stddev = 0)', () => {
    const hist = makeHistory(Array(25).fill(100))
    getBB(hist, 20)
    expect(hist[0].bbUpper20).toBeCloseTo(100, 6)
    expect(hist[0].bbMid20).toBeCloseTo(100, 6)
    expect(hist[0].bbLower20).toBeCloseTo(100, 6)
  })

  it('tail entries without enough history are 0', () => {
    const hist = makeLinearHistory(25)
    getBB(hist, 20)
    for (let i = 6; i < 25; i++) {
      expect(hist[i].bbUpper20).toBe(0)
      expect(hist[i].bbMid20).toBe(0)
      expect(hist[i].bbLower20).toBe(0)
    }
  })

  it('bands widen with larger k multiplier', () => {
    const hist1 = makeLinearHistory(30)
    const hist2 = makeLinearHistory(30)
    getBB(hist1, 20, 2)
    getBB(hist2, 20, 3)
    const width1 = (hist1[0].bbUpper20 as number) - (hist1[0].bbLower20 as number)
    const width2 = (hist2[0].bbUpper20 as number) - (hist2[0].bbLower20 as number)
    expect(width2).toBeGreaterThan(width1)
  })

  it('does not leave sma key on entries when it was not pre-existing', () => {
    const hist = makeLinearHistory(25)
    getBB(hist, 20)
    expect(hist[0].sma20).toBeUndefined()
  })

  it('preserves pre-existing sma key', () => {
    const hist = makeLinearHistory(25)
    getSMA(hist, 20)
    getBB(hist, 20)
    expect(hist[0].sma20).toBeDefined()
  })

  it('upper and lower are symmetric around mid', () => {
    const hist = makeLinearHistory(30)
    getBB(hist, 20)
    for (let i = 0; i <= 10; i++) {
      const mid = hist[i].bbMid20 as number
      const upper = hist[i].bbUpper20 as number
      const lower = hist[i].bbLower20 as number
      expect(upper - mid).toBeCloseTo(mid - lower, 5)
    }
  })
})
