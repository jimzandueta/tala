import { PriceHistoryEntry, PriceKeys } from '../types'
import { getCCI } from './getCCI'

/**
 * CCI Cross Events.
 * Returns only the candles where a cross occurred — NOT the full history.
 * Each returned entry has a `days` property: bars since the previous cross.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @returns Subset of `priceHist` — one entry per cross event.
 */
const getCCICross = (
  priceHist: PriceHistoryEntry[],
  limit = 100,
  period = 20,
  constant = 0.015,
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' }
): PriceHistoryEntry[] => {
  const isWithCCI = priceHist[0].hasOwnProperty('cci')

  if (!isWithCCI) priceHist = getCCI(priceHist, period, constant, priceKeys)

  const arr: PriceHistoryEntry[] = []
  let cIdx = 0

  for (let i = 0; i < priceHist.length; i++) {
    const a = (priceHist[cIdx]['cci'] as number) >= limit
    const d = (priceHist[i]['cci'] as number) < limit

    if (a && d) {
      priceHist[cIdx]['days'] = cIdx
      arr.push(priceHist[cIdx])
      cIdx = i
    } else {
      cIdx = i
    }
    if (!isWithCCI) delete priceHist[i]['cci']
  }

  return arr
}

export { getCCICross }
