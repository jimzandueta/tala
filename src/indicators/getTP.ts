import { PriceHistoryEntry, PriceKeys } from '../types'

/**
 * Typical Price ((High + Low + Close) / 3).
 * Writes `${setKey}` (default: `'tp'`) onto each entry.
 * Used as an input by getCCI.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param priceKeys - OHLC field name mapping (default: `{ c: 'close', h: 'high', l: 'low' }`).
 * @param setKey - Key name for the written value (default: `'tp'`).
 * @returns The mutated `priceHist` array.
 */
const getTP = (
  priceHist: PriceHistoryEntry[],
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' },
  setKey = 'tp'
): PriceHistoryEntry[] => {
  for (let i = 0; i < priceHist.length; i++) {
    const sum = (priceHist[i][priceKeys.c] as number) + (priceHist[i][priceKeys.h] as number) + (priceHist[i][priceKeys.l] as number)
    priceHist[i][setKey] = parseFloat((sum / 3).toFixed(6))
  }
  return priceHist
}

export { getTP }
