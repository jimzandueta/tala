import { getTrend } from '../../src/indicators/getTrend'
import { makeHistory } from '../fixtures'

describe('getTrend', () => {
  // getTrend slices+reverses the array, then compares arr[i] - arr[i-1].
  // If closes=[5,4,3,2,1] (index 0=5 newest), reversed=[1,2,3,4,5] → increasing diffs → returns 1
  // If closes=[1,2,3,4,5] (index 0=1 newest), reversed=[5,4,3,2,1] → decreasing diffs → returns -1

  it('returns 1 when price is falling (newest is highest, oldest is lowest)', () => {
    // closes=[5,4,3,2,1]: index 0=5 (newest), reversed=[1,2,3,4,5] → all diffs positive → 1
    const hist = makeHistory([5, 4, 3, 2, 1])
    expect(getTrend(hist, 'close')).toBe(1)
  })

  it('returns -1 when price is rising (newest is lowest, oldest is highest)', () => {
    // closes=[1,2,3,4,5]: index 0=1 (newest), reversed=[5,4,3,2,1] → all diffs negative → -1
    const hist = makeHistory([1, 2, 3, 4, 5])
    expect(getTrend(hist, 'close')).toBe(-1)
  })

  it('returns 0 for a flat series', () => {
    const hist = makeHistory([5, 5, 5, 5, 5])
    expect(getTrend(hist, 'close')).toBe(0)
  })

  it('returns a number in {-1, 0, 1}', () => {
    const hist = makeHistory([5, 4, 3, 2, 1])
    const result = getTrend(hist, 'close')
    expect([-1, 0, 1]).toContain(result)
  })

  it('respects start and end parameters — only looks at the slice', () => {
    // closes=[5,4,3,100,100]: index 0=5 (newest)
    // slice(0,3) = [5,4,3], reversed=[3,4,5] → diffs positive → 1
    const hist = makeHistory([5, 4, 3, 100, 100])
    expect(getTrend(hist, 'close', 0, 3)).toBe(1)
  })

  it('works with a custom key (e.g., high)', () => {
    // makeHistory sets high = close + 1, so high follows same trend as close
    const hist = makeHistory([5, 4, 3, 2, 1])
    expect(getTrend(hist, 'high')).toBe(1)
  })
})
