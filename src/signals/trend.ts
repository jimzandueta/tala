import { PriceHistoryEntry } from '../types'

/**
 * Trend Signal Helper.
 * Inspects a slice of price history and returns a directional signal:
 * `1` (uptrend), `-1` (downtrend), or `0` (sideways / inconclusive).
 * Does NOT mutate the array.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param key - The field on each entry to compare (e.g. `'close'`, `'ema14'`).
 * @param start - Start index for the slice (default: 0).
 * @param end - End index for the slice (default: end of array).
 * @param isVector - If `true`, uses absolute differences (magnitude only, no direction) (default: false).
 * @returns `1` for uptrend, `-1` for downtrend, `0` for sideways.
 */
const getTrend = (
  priceHist: PriceHistoryEntry[],
  key: string,
  start = 0,
  end?: number,
  isVector = false
): number => {
  let increasing = 0, decreasing = 0, equals = 0
  const sliceEnd = end ?? priceHist.length
  for (let i = start; i < sliceEnd - 1; i++) {
    let difference = (priceHist[i][key] as number) - (priceHist[i + 1][key] as number)
    if (isVector) difference = Math.abs(difference)
    if (difference === 0) equals++
    else if (difference > 0) increasing++
    else decreasing++
  }

  if (increasing > decreasing + equals) return 1
  if (decreasing > increasing + equals) return -1
  return 0
}

export { getTrend }
