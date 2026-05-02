import { PriceHistoryEntry } from '../types'

/**
 * Relative Strength Index.
 * Requires `changeVal` on each entry (`close[i] - close[i+1]`).
 * Writes `${setKey}${period}` (e.g. `rsi14`). Values range 0–100.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param period - RSI period (default: 14).
 * @param changeKey - Field holding the price change per period (default: `'changeVal'`).
 * @param setKey - Prefix for the written key (default: `'rsi'`).
 * @returns The mutated `priceHist` array.
 */
const getRSI = (
  priceHist: PriceHistoryEntry[],
  period = 14,
  changeKey = 'changeVal',
  setKey = 'rsi'
): PriceHistoryEntry[] => {
  for (let i = priceHist.length - 1; i >= 0; i--) {
    let gArr: number[] = []
    let lArr: number[] = []
    let gAve: number | null = null
    let lAve: number | null = null
    let gCur: number | null = null
    let lCur: number | null = null

    if (i <= priceHist.length - 1 - period) {
      for (let j = i; j < i + period; j++) {
        const change = priceHist[j][changeKey] as number
        change >= 0 ? gArr.push(change) : gArr.push(0)
        change < 0 ? lArr.push(Math.abs(change)) : lArr.push(0)
      }
    }
    if (i === priceHist.length - 1 - period) {
      gAve = gArr.reduce((sum, g) => sum + g) / gArr.length
      lAve = lArr.reduce((sum, l) => sum + l) / lArr.length
    } else if (i < priceHist.length - 1 - period) {
      gCur = gArr.slice(0, 1)[0]
      lCur = lArr.slice(0, 1)[0]
      gAve = (((priceHist[i + 1]['gAve'] as number) * (period - 1)) + gCur) / period
      lAve = (((priceHist[i + 1]['lAve'] as number) * (period - 1)) + lCur) / period

      delete priceHist[i + 1]['gAve']
      delete priceHist[i + 1]['lAve']
    } else {
      priceHist[i]['gAve'] = 0
      priceHist[i]['lAve'] = 0
      priceHist[i][`${setKey}${period}`] = 0
    }
    priceHist[i]['gAve'] = gAve ?? undefined
    priceHist[i]['lAve'] = lAve ?? undefined
    if (gAve !== null && lAve !== null) {
      priceHist[i][`${setKey}${period}`] = parseFloat((100 - (100 / (1 + (gAve / lAve)))).toFixed(4))
    }
  }
  return priceHist
}

export { getRSI }
