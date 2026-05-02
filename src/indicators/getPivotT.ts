import { PriceHistoryEntry, PriceKeys } from '../types'

/**
 * Traditional Pivot Points.
 * Divides price history into `period`-bar chunks and writes pivot point (pp),
 * support (s1, s2), and resistance (r1, r2) levels onto each entry using the
 * prior chunk's high/low/close values.
 * Writes `pp${period}`, `r1${period}`, `r2${period}`, `s1${period}`, `s2${period}`.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param period - Bar count per pivot period (default: 20).
 * @param priceKeys - OHLC field name mapping (default: `{ c: 'close', h: 'high', l: 'low' }`).
 * @returns The mutated `priceHist` array.
 */
const getPivotT = (
  priceHist: PriceHistoryEntry[],
  period = 20,
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' }
): PriceHistoryEntry[] => {
  for (let i = 0; i < priceHist.length; i = i + period) {
    if (i < priceHist.length - 2 * period) {
      const c = priceHist[i + period][priceKeys.c] as number
      let h: number | undefined
      let l: number | undefined
      for (let j = i + period; j < i + 2 * period; j++) {
        const jh = priceHist[j][priceKeys.h] as number
        const jl = priceHist[j][priceKeys.l] as number
        h = h === undefined ? jh : (h < jh ? jh : h)
        l = l === undefined ? jl : (l > jl ? jl : l)
      }
      const hv = h!
      const lv = l!
      for (let j = i; j < i + period; j++) {
        priceHist[j][`pp${period}`] = (c + hv + lv) / 3

        priceHist[j][`r1${period}`] = (2 * (priceHist[j][`pp${period}`] as number)) - lv
        priceHist[j][`s1${period}`] = (2 * (priceHist[j][`pp${period}`] as number)) - hv

        priceHist[j][`r2${period}`] = (priceHist[j][`pp${period}`] as number) + (hv - lv)
        priceHist[j][`s2${period}`] = (priceHist[j][`pp${period}`] as number) - (hv - lv)
      }
    }
  }
  return priceHist
}

export { getPivotT }
