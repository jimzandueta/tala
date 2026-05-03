import { PriceHistoryEntry, PriceKeys } from '../../types'

/**
 * True Range.
 * Writes `${setKey}` (default: `'tr'`) onto each entry as the greatest of:
 * high−low, |high−prevClose|, |low−prevClose|.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param priceKeys - OHLC field name mapping (default: `{ c: 'close', h: 'high', l: 'low' }`).
 * @param setKey - Key name for the written value (default: `'tr'`).
 * @returns The mutated `priceHist` array.
 */
const getTR = (
  priceHist: PriceHistoryEntry[],
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' },
  setKey = 'tr'
): PriceHistoryEntry[] => {
  const last = priceHist.length - 1
  for (let i = 0; i < priceHist.length; i++) {
    const h = priceHist[i][priceKeys.h] as number
    const l = priceHist[i][priceKeys.l] as number
    if (i === last) {
      priceHist[i][setKey] = h - l
    } else {
      const prevC = priceHist[i + 1][priceKeys.c] as number
      priceHist[i][setKey] = Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC))
    }
  }
  return priceHist
}

export { getTR }
