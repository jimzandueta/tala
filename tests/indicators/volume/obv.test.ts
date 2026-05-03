import { getOBV } from '../../../src/indicators/volume/obv'
import { makeHistoryWithVolume } from '../../fixtures'
import { PriceHistoryEntry } from '../../../src/types'

describe('getOBV', () => {
  it('returns the same array (mutates in place)', () => {
    const hist = makeHistoryWithVolume([105, 102, 98], [1000, 1200, 800])
    expect(getOBV(hist)).toBe(hist)
  })

  it('seeds oldest bar at OBV = 0', () => {
    const hist = makeHistoryWithVolume([105, 102, 98], [1000, 1200, 800])
    getOBV(hist)
    expect(hist[2].obv).toBe(0)
  })

  it('pure uptrend: OBV monotonically increases toward index 0', () => {
    const closes = [105, 104, 103, 102, 101, 100]
    const vols   = [1000, 1100, 1200, 900, 1300, 1000]
    const hist = makeHistoryWithVolume(closes, vols)
    getOBV(hist)
    for (let i = 0; i < closes.length - 1; i++) {
      expect(hist[i].obv as number).toBeGreaterThan(hist[i + 1].obv as number)
    }
  })

  it('pure downtrend: OBV monotonically decreases toward index 0', () => {
    const closes = [100, 101, 102, 103, 104, 105]
    const vols   = [1000, 1100, 1200, 900, 1300, 1000]
    const hist = makeHistoryWithVolume(closes, vols)
    getOBV(hist)
    for (let i = 0; i < closes.length - 1; i++) {
      expect(hist[i].obv as number).toBeLessThan(hist[i + 1].obv as number)
    }
  })

  it('flat closes: OBV stays constant', () => {
    const hist = makeHistoryWithVolume([100, 100, 100, 100], [1000, 1000, 1000, 1000])
    getOBV(hist)
    for (let i = 0; i < 4; i++) {
      expect(hist[i].obv).toBe(0)
    }
  })

  it('spot check: known sequence', () => {
    const closes = [102, 101, 103, 100]
    const vols   = [200, 150, 100, 0]
    const hist = makeHistoryWithVolume(closes, vols)
    getOBV(hist)
    expect(hist[3].obv).toBe(0)
    expect(hist[2].obv).toBe(100)
    expect(hist[1].obv).toBe(100 - 150)
    expect(hist[0].obv).toBe(100 - 150 + 200)
  })

  it('guards undefined volume with 0', () => {
    const hist: PriceHistoryEntry[] = [
      { open: 105, high: 106, low: 104, close: 105 },
      { open: 100, high: 101, low: 99,  close: 100 },
    ]
    getOBV(hist)
    expect(hist[0].obv).toBe(0)
  })
})
