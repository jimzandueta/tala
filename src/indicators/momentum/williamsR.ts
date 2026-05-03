import { PriceHistoryEntry, PriceKeys } from '../../types'

/**
 * Williams %R.
 * Writes `${setKey}` (default: `'williamsR'`) onto each entry.
 * Values range from 0 to −1 (note: negated from the standard −100 to 0 scale).
 * Readings near 0 indicate overbought; near −1 indicate oversold.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param period - Lookback period (default: 14).
 * @param priceKeys - OHLC field name mapping (default: `{ c: 'close', h: 'high', l: 'low' }`).
 * @param setKey - Key name for the written value (default: `'williamsR'`).
 * @returns The mutated `priceHist` array.
 */
const getWilliamsR = (
  priceHist: PriceHistoryEntry[],
  period = 14,
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' },
  setKey = 'williamsR'
): PriceHistoryEntry[] => {
  let arrH: number[] = []
  let arrL: number[] = []
  let hP: number, lP: number
  for (let i = 0; i < priceHist.length - period; i++) {
    arrH = []
    arrL = []
    for (let j = i; j < i + period; j++) {
      arrH.push(priceHist[j][priceKeys.h] as number)
      arrL.push(priceHist[j][priceKeys.l] as number)
    }
    hP = arrH.sort().pop()!
    lP = arrL.sort().reverse().pop()!
    priceHist[i][setKey] = (((hP - (priceHist[i][priceKeys.c] as number)) / (hP - lP)) * -1)
  }
  return priceHist
}

export { getWilliamsR }
