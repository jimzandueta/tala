import { PriceHistoryEntry, MACDPeriods } from '../types'
import { getMACD } from './getMACD'
import { getSignal } from './getSignal'

/**
 * MACD Histogram (MACD line minus signal line).
 * Writes `${setKey}` onto each entry (default key: `'histogram'`).
 * Computes MACD and signal first if not already present.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param periods - `{ fastPeriod, slowPeriod, signalLength }` — defaults: 12, 26, 9.
 * @param priceKey - Field to read (default: `'close'`).
 * @param setKey - Key name for the histogram (default: `'histogram'`).
 * @returns The mutated `priceHist` array.
 */
const getHistogram = (
  priceHist: PriceHistoryEntry[],
  periods: MACDPeriods,
  priceKey = 'close',
  setKey = 'histogram'
): PriceHistoryEntry[] => {
  const fastPeriod = periods.fastPeriod ?? 12
  const slowPeriod = periods.slowPeriod ?? 26
  const signalLength = periods.signalLength ?? 9

  const isWithMACD = priceHist[0].hasOwnProperty('macd')
  const isWithSignal = priceHist[0].hasOwnProperty('signal')

  if (!isWithMACD) priceHist = getMACD(priceHist, { fastPeriod, slowPeriod }, {}, priceKey)
  if (!isWithSignal) priceHist = getSignal(priceHist, { fastPeriod, slowPeriod, signalLength }, priceKey)

  for (let i = 0; i < priceHist.length; i++) {
    priceHist[i][setKey] = parseFloat(((priceHist[i].macd as number) - (priceHist[i].signal as number)).toFixed(6))
  }
  return priceHist
}

export { getHistogram }
