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
  for (let i = 0; i < priceHist.length; i++) {
    const arr = [
      (priceHist[i][priceKeys.h] as number) - (priceHist[i][priceKeys.l] as number),
      Math.abs(i === priceHist.length - 1 ? 0 : (priceHist[i][priceKeys.h] as number) - (priceHist[i + 1][priceKeys.c] as number)),
      Math.abs(i === priceHist.length - 1 ? 0 : (priceHist[i][priceKeys.l] as number) - (priceHist[i + 1][priceKeys.c] as number)),
    ]
    priceHist[i][setKey] = arr.sort().pop()!
  }
  return priceHist
}

export { getTR }
