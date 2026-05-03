import { getSMA } from '../../../src/indicators/trend/sma'
import { makeHistory } from '../../fixtures'

describe('getSMA', () => {
  it('returns the same array (mutates in place)', () => {
    const hist = makeHistory([5, 4, 3, 2, 1])
    expect(getSMA(hist, 3)).toBe(hist)
  })

  it('computes correct SMA for uniform prices', () => {
    const hist = makeHistory([10, 10, 10, 10, 10])
    getSMA(hist, 3)
    expect(hist[0].sma3).toBe(10)
    expect(hist[1].sma3).toBe(10)
    expect(hist[2].sma3).toBe(10)
  })

  it('computes correct SMA for linear prices', () => {
    // closes: [5, 4, 3, 2, 1] — index 0 most recent
    const hist = makeHistory([5, 4, 3, 2, 1])
    getSMA(hist, 3)
    // sma3[0] = (5+4+3)/3 = 4
    expect(hist[0].sma3).toBeCloseTo(4, 5)
    // sma3[1] = (4+3+2)/3 = 3
    expect(hist[1].sma3).toBeCloseTo(3, 5)
    // sma3[2] = (3+2+1)/3 = 2
    expect(hist[2].sma3).toBeCloseTo(2, 5)
  })

  it('fills trailing entries with 0 when insufficient history', () => {
    const hist = makeHistory([5, 4, 3, 2, 1])
    getSMA(hist, 3)
    expect(hist[3].sma3).toBe(0)
    expect(hist[4].sma3).toBe(0)
  })

  it('uses custom priceKey and setKey', () => {
    const hist = makeHistory([10, 10, 10])
    hist[0].open = 20
    hist[1].open = 20
    hist[2].open = 20
    getSMA(hist, 3, 'open', 'smaOpen')
    expect(hist[0].smaOpen3).toBe(20)
  })
})
