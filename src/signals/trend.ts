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
  const diff = {
    increasing: [] as number[],
    decreasing: [] as number[],
    equals: [] as number[]
  }
  const arr = priceHist.slice(start, end).reverse()
  arr.map((item, index, array) => {
    if (index > 0) {
      let difference = (item[key] as number) - (array[index - 1][key] as number)
      difference = isVector ? Math.abs(difference) : difference

      if (difference === 0) diff.equals.push(difference)
      else if (difference > 0) diff.increasing.push(difference)
      else diff.decreasing.push(difference)
    }
    return item
  })

  if (diff.increasing.length > (diff.decreasing.length + diff.equals.length)) return 1
  if (diff.decreasing.length > (diff.increasing.length + diff.equals.length)) return -1
  if (diff.equals.length > (diff.increasing.length + diff.decreasing.length)) return 0

  return 0
}

export { getTrend }
