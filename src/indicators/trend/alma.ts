import { PriceHistoryEntry } from '../../types'

/**
 * Arnaud Legoux Moving Average.
 * Writes `alma` onto each entry using a Gaussian-weighted window.
 * Reduces lag while minimizing noise compared to standard moving averages.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param period - Window length (default: 9).
 * @param sigma - Width of the Gaussian distribution (default: 6.0).
 * @param offset - Position of the Gaussian peak within the window, 0–1 (default: 0.85).
 * @param keyPrice - Field to read from each entry (default: `'close'`).
 * @returns The mutated `priceHist` array.
 */
const getALMA = (
  priceHist: PriceHistoryEntry[],
  period = 9,
  sigma = 6.0,
  offset = 0.85,
  keyPrice = 'close'
): PriceHistoryEntry[] => {
  const window = period + 1
  const m = Math.floor(offset * period)
  const s = period / sigma
  for (let i = 0; i < priceHist.length; i++) {
    let cSum = 0.0
    let norm = 0.0
    if (i + period < priceHist.length) {
      for (let j = i; j < i + window; j++) {
        const jj = j - i
        const coeff = Math.exp(-((jj - m) * (jj - m)) / (2 * s * s))
        cSum += (priceHist[(i + window) - 1 - jj][keyPrice] as number) * coeff
        norm += coeff
      }
      priceHist[i].alma = parseFloat((cSum / norm).toFixed(4))
    } else {
      priceHist[i].alma = 0
    }
  }
  return priceHist
}

export { getALMA }
