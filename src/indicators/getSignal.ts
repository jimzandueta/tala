import { PriceHistoryEntry, MACDPeriods } from '../types'
import { getSMA } from './getSMA'
import { getMACD } from './getMACD'

/**
 * MACD Signal Line (EMA of the MACD line).
 * Writes `${setKey}` onto each entry (default key: `'signal'`).
 * Computes MACD first if not already present on the history entries.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param periods - `{ fastPeriod, slowPeriod, signalLength }` — defaults: 12, 26, 9.
 * @param priceKey - Field to read (default: `'close'`).
 * @param setKey - Key name for the signal line (default: `'signal'`).
 * @returns The mutated `priceHist` array.
 */
const getSignal = (
  priceHist: PriceHistoryEntry[],
  periods: MACDPeriods,
  priceKey = 'close',
  setKey = 'signal'
): PriceHistoryEntry[] => {
  const fastPeriod = periods.fastPeriod ?? 12
  const slowPeriod = periods.slowPeriod ?? 26
  const signalLength = periods.signalLength ?? 9

  const isWithMACD = priceHist[0].hasOwnProperty('macd')
  const isWithMACDSMA = priceHist[0].hasOwnProperty(`macdsma${signalLength}`)

  if (!isWithMACD) priceHist = getMACD(priceHist, { fastPeriod, slowPeriod }, {}, priceKey)
  if (!isWithMACDSMA) priceHist = getSMA(priceHist, signalLength, 'macd', 'macdsma')

  const s = 2
  const k = s / (1 + signalLength)
  for (let i = priceHist.length - 1; i >= 0; i--) {
    if (i === priceHist.length - signalLength - slowPeriod - 1) {
      priceHist[i][setKey] = priceHist[i][`macdsma${signalLength}`] as number
    } else if (i < priceHist.length - signalLength - slowPeriod - 1) {
      priceHist[i][setKey] = parseFloat(((priceHist[i].macd as number * k) + ((priceHist[i + 1][setKey] as number) * (1 - k))).toFixed(6))
    } else {
      priceHist[i][setKey] = 0
    }
    if (!isWithMACD) delete priceHist[i]['macd']
    if (!isWithMACDSMA) delete priceHist[i][`macdsma${signalLength}`]
  }
  return priceHist
}

export { getSignal }
