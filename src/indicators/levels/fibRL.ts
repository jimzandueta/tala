import { PriceHistoryEntry, PriceKeys } from '../../types'
import { getPivotT } from './pivotT'

/**
 * Fibonacci Retracement Levels.
 * Builds on getPivotT to write five Fibonacci retracement levels
 * (`fib0.236`, `fib0.382`, `fib0.5`, `fib0.618`, `fib0.786`) onto each entry,
 * interpolated between the pivot's s2 and r2 levels.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param period - Bar count per pivot period (default: 20).
 * @param priceKeys - OHLC field name mapping (default: `{ c: 'close', h: 'high', l: 'low' }`).
 * @returns The mutated `priceHist` array.
 */
const getFibRL = (
  priceHist: PriceHistoryEntry[],
  period = 20,
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' }
): PriceHistoryEntry[] => {
  const rs = [0.236, 0.382, 0.5, 0.618, 0.786]

  getPivotT(priceHist, period, priceKeys)
  for (let i = 0; i < priceHist.length; i++) {
    if (i < priceHist.length - period) {
      rs.forEach(r => {
        const p1 = priceHist[i][`s2${period}`] as number
        const p2 = priceHist[i][`r2${period}`] as number
        priceHist[i][`fib${r}`] = p2 - (Math.abs((p2 - p1)) * r)
      })
    }
  }
  return priceHist
}

export { getFibRL }
