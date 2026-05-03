import { getVWAP } from '../../../src/indicators/volume/vwap'
import { makeHistoryWithVolume } from '../../fixtures'

describe('getVWAP', () => {
  it('returns the same array (mutates in place)', () => {
    const hist = makeHistoryWithVolume([100, 101, 102, 103, 104], [100, 100, 100, 100, 100])
    expect(getVWAP(hist, 3)).toBe(hist)
  })

  it('uniform price and volume: vwap = TP = close (since high=close+1, low=close-1)', () => {
    const closes = Array(20).fill(100)
    const vols   = Array(20).fill(1000)
    const hist = makeHistoryWithVolume(closes, vols)
    getVWAP(hist, 14)
    for (let i = 0; i <= 6; i++) {
      expect(hist[i].vwap14).toBeCloseTo(100, 5)
    }
  })

  it('tail entries when period > length are all 0', () => {
    const hist = makeHistoryWithVolume([100, 101, 102], [100, 100, 100])
    getVWAP(hist, 5)
    for (let i = 0; i < 3; i++) {
      expect(hist[i].vwap5).toBe(0)
    }
  })

  it('tail entries in a longer series are 0', () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 + i)
    const vols   = Array(20).fill(500)
    const hist = makeHistoryWithVolume(closes, vols)
    getVWAP(hist, 14)
    for (let i = 7; i < 20; i++) {
      expect(hist[i].vwap14).toBe(0)
    }
  })

  it('zero volume falls back to TP of the window', () => {
    const hist = makeHistoryWithVolume([100, 100, 100], [0, 0, 0])
    getVWAP(hist, 3)
    expect(hist[0].vwap3).toBeCloseTo(100, 5)
  })

  it('uses rolling window (period=3, spot check)', () => {
    const closes = [100, 102, 104, 106, 108]
    const vols   = [100, 100, 100, 100, 100]
    const hist = makeHistoryWithVolume(closes, vols)
    getVWAP(hist, 3)
    const tp = (entry: (typeof hist)[0]) => ((entry.high as number) + (entry.low as number) + (entry.close as number)) / 3
    const expected0 = (tp(hist[0]) * 100 + tp(hist[1]) * 100 + tp(hist[2]) * 100) / 300
    expect(hist[0].vwap3).toBeCloseTo(expected0, 5)
  })

  it('supports custom setKey', () => {
    const hist = makeHistoryWithVolume([100, 101, 102, 103, 104], [100, 100, 100, 100, 100])
    getVWAP(hist, 3, { c: 'close', h: 'high', l: 'low' }, 'volume', 'myVwap')
    expect(hist[0].myVwap3).toBeDefined()
  })
})
