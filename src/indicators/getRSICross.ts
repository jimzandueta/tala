import { PriceHistoryEntry } from '../types'
import { getRSI } from './getRSI'

/**
 * RSI Cross Events.
 * Returns only the candles where a cross occurred — NOT the full history.
 * Each returned entry has a `days` property: bars since the previous cross.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @returns Subset of `priceHist` — one entry per cross event.
 */
const getRSICross = (
  priceHist: PriceHistoryEntry[],
  limits = [50, 55],
  period = 14,
  changeKey = 'changeVal'
): PriceHistoryEntry[] => {
  const isWithRSI = priceHist[0].hasOwnProperty(`rsi${period}`)

  if (!isWithRSI) priceHist = getRSI(priceHist, period, changeKey)

  const arr: PriceHistoryEntry[] = []
  let cIdx = 0

  for (let i = 0; i < priceHist.length; i++) {
    const a = (priceHist[cIdx][`rsi${period}`] as number) >= limits[1]
    const b = (priceHist[cIdx][`rsi${period}`] as number) >= limits[0] && (priceHist[cIdx][`rsi${period}`] as number) < limits[1]
    const c = (priceHist[cIdx][`rsi${period}`] as number) < limits[0]
    const d = (priceHist[i][`rsi${period}`] as number) >= limits[1]
    const e = (priceHist[i][`rsi${period}`] as number) >= limits[0] && (priceHist[i][`rsi${period}`] as number) < limits[1]
    const f = (priceHist[i][`rsi${period}`] as number) < limits[0]

    if ((a && (e || f)) || (b && f)) {
      priceHist[cIdx]['days'] = cIdx
      arr.push(priceHist[cIdx])
      cIdx = i
    } else if ((c && (f || e || d)) || (b && (e || d)) || (a && d)) {
      cIdx = i
    }
    if (!isWithRSI) delete priceHist[i][`rsi${period}`]
  }

  return arr
}

export { getRSICross }
