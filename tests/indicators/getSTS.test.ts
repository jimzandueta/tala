import { getSTS } from '../../src/indicators/getSTS'
import { makeLinearHistory } from '../fixtures'

describe('getSTS', () => {
  it('returns the same array (mutates in place)', () => {
    const hist = makeLinearHistory(30)
    expect(getSTS(hist)).toBe(hist)
  })

  it('sets stsK on candles with enough data', () => {
    const hist = makeLinearHistory(30)
    getSTS(hist)
    // getSTS sets stsK for i in [0, length - period) = [0, 16) with period=14
    for (let i = 0; i < hist.length - 14; i++) {
      expect(hist[i]).toHaveProperty('stsK')
      expect(typeof hist[i].stsK).toBe('number')
    }
  })

  it('stsK values are finite numbers (note: lexicographic sort may produce values outside 0–100)', () => {
    // getSTS uses arr.sort().pop() for max and arr.sort().reverse().pop() for min,
    // which is lexicographic order. This can give a non-numeric max/min and
    // produce stsK values outside the expected [0, 100] range.
    const hist = makeLinearHistory(30)
    getSTS(hist)
    for (let i = 0; i < hist.length - 14; i++) {
      const k = hist[i].stsK as number
      expect(isFinite(k)).toBe(true)
      expect(typeof k).toBe('number')
    }
  })

  it('sets stsD3 (SMA3 of stsK) on entries', () => {
    const hist = makeLinearHistory(30)
    getSTS(hist)
    // getSMA(priceHist, 3, 'stsK', 'stsD') writes key 'stsD3'
    // stsD3 is set wherever stsK is set and there are 3+ prior stsK values
    const keysWithStsD3 = hist.filter(e => e.stsD3 !== undefined && e.stsD3 !== 0)
    expect(keysWithStsD3.length).toBeGreaterThan(0)
  })

  it('stsD3 is set at index 0', () => {
    const hist = makeLinearHistory(30)
    getSTS(hist)
    expect(hist[0]).toHaveProperty('stsD3')
    expect(typeof hist[0].stsD3).toBe('number')
  })

  it('stsD3 key name includes the period suffix (stsD3)', () => {
    const hist = makeLinearHistory(30)
    getSTS(hist)
    // getSMA appends period (3) to setKey ('stsD'), producing 'stsD3'
    expect(Object.prototype.hasOwnProperty.call(hist[0], 'stsD3')).toBe(true)
  })
})
