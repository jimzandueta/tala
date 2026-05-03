import { PriceHistoryEntry } from '../../types'

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
  const seedIdx = priceHist.length - 1 - period

  for (let i = priceHist.length - 1; i >= 0; i--) {
    if (i > seedIdx) {
      priceHist[i][`${setKey}${period}`] = 0
      continue
    }

    let gAve: number
    let lAve: number

    if (i === seedIdx) {
      // Seed: simple average of gains and losses over first `period` bars
      let gSum = 0, lSum = 0
      for (let j = i; j < i + period; j++) {
        const change = priceHist[j][changeKey] as number
        if (change >= 0) gSum += change; else lSum -= change
      }
      gAve = gSum / period
      lAve = lSum / period
    } else {
      // Rolling Wilder smoothing — no need to rebuild arrays
      const change = priceHist[i][changeKey] as number
      const gCur = change >= 0 ? change : 0
      const lCur = change < 0 ? -change : 0
      gAve = ((priceHist[i + 1]['gAve'] as number) * (period - 1) + gCur) / period
      lAve = ((priceHist[i + 1]['lAve'] as number) * (period - 1) + lCur) / period
      delete priceHist[i + 1]['gAve']
      delete priceHist[i + 1]['lAve']
    }

    priceHist[i]['gAve'] = gAve
    priceHist[i]['lAve'] = lAve
    priceHist[i][`${setKey}${period}`] = parseFloat((100 - (100 / (1 + (gAve / lAve)))).toFixed(4))
  }

  return priceHist
}

export { getRSI }
