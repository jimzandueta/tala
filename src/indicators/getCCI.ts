import { PriceHistoryEntry, PriceKeys } from '../types'
import { getTP } from './getTP'
import { getSMA } from './getSMA'

/**
 * Commodity Channel Index.
 * Writes `${setKey}` (default: `'cci'`) onto each entry.
 * Measures how far the typical price is from its mean, scaled by mean deviation.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param period - CCI period (default: 20).
 * @param constant - Lambert constant for scaling (default: 0.015).
 * @param priceKeys - OHLC field name mapping (default: `{ c: 'close', h: 'high', l: 'low' }`).
 * @param setKey - Key name for the written value (default: `'cci'`).
 * @returns The mutated `priceHist` array.
 */
const getCCI = (
  priceHist: PriceHistoryEntry[],
  period = 20,
  constant = 0.015,
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' },
  setKey = 'cci'
): PriceHistoryEntry[] => {
  priceHist = getTP(priceHist, priceKeys)
  priceHist = getSMA(priceHist, period, 'tp', 'smatp')

  for (let i = priceHist.length - 1; i >= 0; i--) {
    if (i <= priceHist.length - period) {
      let mdSum = 0.0
      for (let j = i; j < i + period; j++) {
        mdSum += Math.abs((priceHist[j]['tp'] as number) - (priceHist[i][`smatp${period}`] as number))
      }
      const md = mdSum / period
      priceHist[i][setKey] = parseFloat((((priceHist[i]['tp'] as number) - (priceHist[i][`smatp${period}`] as number)) / (constant * md)).toFixed(4))
    } else {
      priceHist[i][setKey] = 0
    }
  }
  return priceHist
}

export { getCCI }
