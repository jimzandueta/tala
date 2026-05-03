import { PriceHistoryEntry } from '../../types'

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
  const len = priceHist.length
  const last = len - period

  if (last < 0) {
    for (let i = 0; i < len; i++) priceHist[i][`${setKey}${period}`] = 0
    return priceHist
  }

  // Zero tail entries without enough history
  for (let i = last + 1; i < len; i++) priceHist[i][`${setKey}${period}`] = 0

  // Seed at i=0 (newest) — inputs [0..period-1] are always defined for valid input data
  let windowSum = 0
  for (let j = 0; j < period; j++) windowSum += priceHist[j][priceKey] as number
  priceHist[0][`${setKey}${period}`] = parseFloat((windowSum / period).toFixed(6))

  // Slide toward older bars (increasing i): subtract the bar leaving, add the bar entering
  for (let i = 1; i <= last; i++) {
    windowSum = windowSum
      - (priceHist[i - 1][priceKey] as number)
      + (priceHist[i + period - 1][priceKey] as number)
    priceHist[i][`${setKey}${period}`] = parseFloat((windowSum / period).toFixed(6))
  }

  return priceHist
}

export { getSMA }
