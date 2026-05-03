import { PriceHistoryEntry, PriceKeys } from '../types'
import { getFisher } from '../indicators/momentum/fisher'

/**
 * Fisher Transform Cross Events.
 * Returns only the candles where a cross occurred — NOT the full history.
 * Each returned entry has a `days` property: bars since the previous cross.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @returns Subset of `priceHist` — one entry per cross event.
 */
const getFisherCross = (
  priceHist: PriceHistoryEntry[],
  period = 9,
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' }
): PriceHistoryEntry[] => {
  const isWithFisherT = priceHist[0].hasOwnProperty('fisherTransform')
  if (!isWithFisherT) priceHist = getFisher(priceHist, period, priceKeys)

  const arr: PriceHistoryEntry[] = []
  let cIdx = 0

  for (let i = 0; i < priceHist.length; i++) {
    const a = (priceHist[cIdx].fisherTransform as number) > (priceHist[cIdx].fisherSignal as number)
    const b = (priceHist[i].fisherTransform as number) > (priceHist[i].fisherSignal as number)
    if (!a !== !b) {
      priceHist[i - cIdx - 1]['days'] = i - cIdx - 1
      arr.push(priceHist[i - cIdx - 1])
      cIdx = i
    }
  }
  return arr
}

export { getFisherCross }
