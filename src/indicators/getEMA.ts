import { PriceHistoryEntry } from '../types'
import { getSMA } from './getSMA'

/**
 * Exponential Moving Average.
 * Writes `${setKey}${period}` onto each entry (e.g. `ema14`).
 * Seeds the EMA from the SMA at the oldest valid position. Entries without
 * enough lookback history are set to 0.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param period - Number of periods for the EMA.
 * @param offset - Index offset for the seed position (default: `0`).
 * @param priceKey - Field to read from each entry (default: `'close'`).
 * @param setKey - Prefix for the written key (default: `'ema'`).
 * @returns The mutated `priceHist` array.
 */
const getEMA = (
  priceHist: PriceHistoryEntry[],
  period: number,
  offset?: number | null,
  priceKey = 'close',
  setKey = 'ema'
): PriceHistoryEntry[] => {
  const s = 2
  const k = s / (1 + period)
  const isWithSMA = priceHist[0].hasOwnProperty(`sma${period}`)
  const off = offset ?? 0

  if (!isWithSMA) priceHist = getSMA(priceHist, period)

  for (let i = priceHist.length - 1; i >= 0; i--) {
    if (i === priceHist.length - period - off) {
      priceHist[i][`${setKey}${period}`] = priceHist[i][`sma${period}`] as number
    } else if (i < priceHist.length - period - off) {
      priceHist[i][`${setKey}${period}`] = ((priceHist[i][priceKey] as number) * k) + ((priceHist[i + 1][`${setKey}${period}`] as number) * (1 - k))
    } else {
      priceHist[i][`${setKey}${period}`] = 0
    }

    if (!isWithSMA) delete priceHist[i][`sma${period}`]
  }
  return priceHist
}

export { getEMA }
