import { PriceHistoryEntry } from '../types'

/**
 * Simple Moving Average.
 * Writes `${setKey}${period}` onto each entry (e.g. `sma14`).
 * Entries without enough lookback history are set to 0.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param period - Number of periods to average.
 * @param priceKey - Field to read from each entry (default: `'close'`).
 * @param setKey - Prefix for the written key (default: `'sma'`).
 * @returns The mutated `priceHist` array.
 */
const getSMA = (priceHist: PriceHistoryEntry[], period: number, priceKey = 'close', setKey = 'sma'): PriceHistoryEntry[] => {
  for (let i = 0; i < priceHist.length; i++) {
    if (i < priceHist.length - period + 1) {
      let tt = 0
      for (let j = i; j < i + period; j++) {
        tt += priceHist[j][priceKey] as number
      }
      priceHist[i][`${setKey}${period}`] = parseFloat((tt / period).toFixed(6))
    } else {
      priceHist[i][`${setKey}${period}`] = 0
    }
  }
  return priceHist
}

export { getSMA }
