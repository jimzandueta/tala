import { PriceHistoryEntry, PriceKeys, STSSetKey } from '../../types'
import { getSMA } from '../trend/sma'

/**
 * Stochastic Oscillator (%K and %D).
 * Writes `${setKey.k}` (%K line) and `${setKey.d}3` (3-period SMA of %K) onto each entry.
 * Default output keys: `stsK` (%K) and `stsD3` (%D).
 * Values range 0–100; readings above 80 suggest overbought, below 20 oversold.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param period - Lookback period for high/low range (default: 14).
 * @param priceKeys - OHLC field name mapping (default: `{ c: 'close', h: 'high', l: 'low' }`).
 * @param setKey - Output key names for %K and base prefix for %D (default: `{ k: 'stsK', d: 'stsD' }`).
 *   Note: the %D key written to each entry is `${setKey.d}3` (e.g. `stsD3`) because getSMA appends the period.
 * @returns The mutated `priceHist` array.
 */
const getSTS = (
  priceHist: PriceHistoryEntry[],
  period = 14,
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' },
  setKey: STSSetKey = { k: 'stsK', d: 'stsD' }
): PriceHistoryEntry[] => {
  for (let i = 0; i < priceHist.length - period; i++) {
    let hP = priceHist[i][priceKeys.h] as number
    let lP = priceHist[i][priceKeys.l] as number
    for (let j = i + 1; j < i + period; j++) {
      const jh = priceHist[j][priceKeys.h] as number
      const jl = priceHist[j][priceKeys.l] as number
      if (jh > hP) hP = jh
      if (jl < lP) lP = jl
    }
    priceHist[i][setKey.k] = (((priceHist[i][priceKeys.c] as number) - lP) / (hP - lP)) * 100
  }
  priceHist = getSMA(priceHist, 3, setKey.k, setKey.d)
  return priceHist
}

export { getSTS }
