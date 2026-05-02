import { PriceHistoryEntry, MACDPeriods } from '../types'
import { getMACD } from './getMACD'

/**
 * MACD Cross Events.
 * Returns only the candles where a cross occurred — NOT the full history.
 * Each returned entry has a `days` property: bars since the previous cross.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param periods - `{ fastPeriod, slowPeriod, signalLength }` — defaults: 12, 26, 9.
 * @param priceKey - Field to read (default: `'close'`).
 * @returns Subset of `priceHist` — one entry per cross event.
 */
const getMACDCross = (
  priceHist: PriceHistoryEntry[],
  periods?: MACDPeriods,
  priceKey = 'close'
): PriceHistoryEntry[] => {
  const p: MACDPeriods = periods ?? { fastPeriod: 12, slowPeriod: 26, signalLength: 9 }
  const options = { includeSignal: true, includeHistogram: true }

  const isWithMACD = priceHist[0].hasOwnProperty('macd')
  if (!isWithMACD) priceHist = getMACD(priceHist, p, options, priceKey, 'macd')

  const arr: PriceHistoryEntry[] = []
  let cIdx = 0

  for (let i = 0; i < priceHist.length; i++) {
    const a = (priceHist[cIdx].macd as number) > (priceHist[cIdx].signal as number)
    const b = (priceHist[i].macd as number) > (priceHist[i].signal as number)
    if (!a !== !b) {
      priceHist[i - 1]['days'] = i - cIdx
      arr.push(priceHist[i - 1])
      cIdx = i
    }
    if (!isWithMACD) delete priceHist[i]['macd']
  }
  return arr
}

export { getMACDCross }
