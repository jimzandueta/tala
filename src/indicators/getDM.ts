import { PriceHistoryEntry, PriceKeys } from '../types'

/**
 * Directional Movement (DM+/DM−).
 * Writes `dmp` (positive DM) and `dmn` (negative DM) onto each entry.
 * Used internally by getADX.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param priceKeys - OHLC field name mapping (default: `{ c: 'close', h: 'high', l: 'low' }`).
 * @param setKey - Base key name (default: `'dm'`; not directly used as output prefix — outputs are always `dmp`/`dmn`).
 * @returns The mutated `priceHist` array.
 */
const getDM = (
  priceHist: PriceHistoryEntry[],
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' },
  setKey = 'dm'
): PriceHistoryEntry[] => {
  for (let i = 0; i < priceHist.length; i++) {
    priceHist[i]['dmp'] = (priceHist[i][priceKeys.h] as number) - (i === priceHist.length - 1 ? 0 : priceHist[i + 1][priceKeys.h] as number)
    priceHist[i]['dmn'] = (i === priceHist.length - 1 ? 0 : priceHist[i + 1][priceKeys.l] as number) - (priceHist[i][priceKeys.l] as number)
    if ((priceHist[i]['dmp'] as number) < 0 && (priceHist[i]['dmn'] as number) < 0) {
      priceHist[i]['dmn'] = 0
      priceHist[i]['dmp'] = 0
    } else if ((priceHist[i]['dmp'] as number) > (priceHist[i]['dmn'] as number)) {
      priceHist[i]['dmn'] = 0
    } else if ((priceHist[i]['dmp'] as number) < (priceHist[i]['dmn'] as number)) {
      priceHist[i]['dmp'] = 0
    } else {
      priceHist[i]['dmn'] = 0
      priceHist[i]['dmp'] = 0
    }
  }
  return priceHist
}

export { getDM }
