import { PriceHistoryEntry } from '../../types'
import { getSMA } from './sma'

/**
 * Wilder's Exponential Moving Average (RMA/SMMA).
 * Uses a smoothing factor of `1/period` instead of `2/(period+1)`.
 * Writes `${setKey}${period}` onto each entry (e.g. `wema14`).
 * Seeds the average from the SMA at the oldest valid position.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param period - Number of periods for the smoothing.
 * @param offset - Index offset for the seed position (default: `0`).
 * @param priceKey - Field to read from each entry (default: `'close'`).
 * @param setKey - Prefix for the written key (default: `'wema'`).
 * @returns The mutated `priceHist` array.
 */
const getWEMA = (
  priceHist: PriceHistoryEntry[],
  period: number,
  offset: number,
  priceKey = 'close',
  setKey = 'wema'
): PriceHistoryEntry[] => {
  const k = 1 / period
  const isWithSMA = priceHist[0].hasOwnProperty(`sma${setKey}${period}`)
  const off = offset || 0

  if (!isWithSMA) priceHist = getSMA(priceHist, period, priceKey, `sma${setKey}`)

  for (let i = priceHist.length - 1; i >= 0; i--) {
    if (i === priceHist.length - period - off) {
      priceHist[i][`${setKey}${period}`] = priceHist[i][`sma${setKey}${period}`] as number
    } else if (i < priceHist.length - period - off) {
      priceHist[i][`${setKey}${period}`] = (priceHist[i + 1][`${setKey}${period}`] as number) * (1 - k) + (priceHist[i][priceKey] as number) * k
    } else {
      priceHist[i][`${setKey}${period}`] = 0
    }
    if (!isWithSMA) delete priceHist[i][`sma${setKey}${period}`]
  }
  return priceHist
}

export { getWEMA }
