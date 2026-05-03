import { PriceHistoryEntry, MACDPeriods, MACDOptions } from '../../types'
import { getEMA } from './ema'
import { getSignal } from './signal'
import { getHistogram } from './histogram'

/**
 * Moving Average Convergence Divergence.
 * Writes `${setKey}` (MACD line) onto each entry.
 * Optionally computes signal line and histogram via `options`.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param periods - `{ fastPeriod, slowPeriod, signalLength }` — defaults: 12, 26, 9.
 * @param options - `{ includeSignal, includeHistogram }`.
 * @param priceKey - Field to read (default: `'close'`).
 * @param setKey - Key name for MACD line (default: `'macd'`).
 * @returns The mutated `priceHist` array.
 *
 * @example
 * const periods = { fastPeriod: 12, slowPeriod: 26, signalLength: 9 }
 * getMACD(priceHistory, periods, { includeSignal: true, includeHistogram: true })
 * // priceHistory[0].macd, .signal, .histogram are now set
 */
const getMACD = (
  priceHist: PriceHistoryEntry[],
  periods: MACDPeriods,
  options: MACDOptions,
  priceKey = 'close',
  setKey = 'macd'
): PriceHistoryEntry[] => {
  const fastPeriod = periods.fastPeriod ?? 12
  const slowPeriod = periods.slowPeriod ?? 26
  const signalLength = periods.signalLength ?? 9

  const isWithEMAFast = priceHist[0].hasOwnProperty(`ema${fastPeriod}`)
  const isWithEMASlow = priceHist[0].hasOwnProperty(`ema${slowPeriod}`)

  if (!isWithEMAFast) priceHist = getEMA(priceHist, fastPeriod, 0, priceKey)
  if (!isWithEMASlow) priceHist = getEMA(priceHist, slowPeriod, 0, priceKey)

  for (let i = 0; i < priceHist.length; i++) {
    if (i < priceHist.length - slowPeriod - 1) {
      priceHist[i][setKey] = parseFloat(((priceHist[i][`ema${fastPeriod}`] as number) - (priceHist[i][`ema${slowPeriod}`] as number)).toFixed(6))
    } else {
      priceHist[i][setKey] = 0
    }

    if (!isWithEMAFast) delete priceHist[i][`ema${fastPeriod}`]
    if (!isWithEMASlow) delete priceHist[i][`ema${slowPeriod}`]
  }

  if (options.includeSignal) priceHist = getSignal(priceHist, { fastPeriod, slowPeriod, signalLength }, priceKey)
  if (options.includeHistogram) priceHist = getHistogram(priceHist, { fastPeriod, slowPeriod, signalLength }, priceKey)

  return priceHist
}

export { getMACD }
