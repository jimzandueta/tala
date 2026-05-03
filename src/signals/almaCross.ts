import { PriceHistoryEntry } from '../types'
import { getALMA } from '../indicators/trend/alma'

/**
 * ALMA Cross Events.
 * Returns only the candles where a cross occurred — NOT the full history.
 * Each returned entry has a `days` property: bars since the previous cross.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @returns Subset of `priceHist` — one entry per cross event.
 */
const getALMACross = (
  priceHist: PriceHistoryEntry[],
  period = 9,
  sigma = 6.0,
  offset = 0.85,
  keyPrice = 'close'
): PriceHistoryEntry[] => {
  const isWithALMA = priceHist[0].hasOwnProperty('alma')

  if (!isWithALMA) priceHist = getALMA(priceHist, period, sigma, offset, keyPrice)

  const arr: PriceHistoryEntry[] = []
  let cIdx = 0

  for (let i = 0; i < priceHist.length; i++) {
    const a = (priceHist[cIdx][keyPrice] as number) >= (priceHist[cIdx]['alma'] as number)
    const d = (priceHist[i][keyPrice] as number) < (priceHist[i]['alma'] as number)

    if (a && d) {
      priceHist[cIdx]['days'] = cIdx
      arr.push(priceHist[cIdx])
      cIdx = i
    } else {
      cIdx = i
    }
    if (!isWithALMA) delete priceHist[i]['alma']
  }

  return arr
}

export { getALMACross }
