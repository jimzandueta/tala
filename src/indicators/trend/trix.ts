import { PriceHistoryEntry } from '../../types'
import { getEMA } from './ema'

/**
 * TRIX (Triple Exponential Moving Average Rate of Change).
 * Applies EMA three times and outputs the 1-period percentage change of the
 * triple-smoothed value. Writes `${setKey}` onto each entry (e.g. `trix`).
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param period - EMA period applied three times (default: 18).
 * @param priceKey - Field to read from each entry (default: `'close'`).
 * @param setKey - Key name for the written value (default: `'trix'`).
 * @returns The mutated `priceHist` array.
 */
const getTRIX = (
  priceHist: PriceHistoryEntry[],
  period = 18,
  priceKey = 'close',
  setKey = 'trix'
): PriceHistoryEntry[] => {
  priceHist = getEMA(priceHist, period, null, priceKey, 'ema1S')
  priceHist = getEMA(priceHist, period, period, `ema1S${period}`, 'ema2S')
  priceHist = getEMA(priceHist, period, period * 2, `ema2S${period}`, 'ema3S')

  for (let i = 0; i < priceHist.length; i++) {
    if (i < priceHist.length - 1) {
      priceHist[i][setKey] = (((priceHist[i][`ema3S${period}`] as number) - (priceHist[i + 1][`ema3S${period}`] as number)) / (priceHist[i + 1][`ema3S${period}`] as number)) * 100
    } else {
      priceHist[i][setKey] = 0
    }
  }
  return priceHist
}

export { getTRIX }
