import { PriceHistoryEntry } from '../../types'
import { getSMA } from './sma'

const getBB = (
  priceHist: PriceHistoryEntry[],
  period = 20,
  k = 2,
  priceKey = 'close'
): PriceHistoryEntry[] => {
  const len = priceHist.length
  const last = len - period

  if (last < 0) {
    for (let i = 0; i < len; i++) {
      priceHist[i][`bbUpper${period}`] = 0
      priceHist[i][`bbMid${period}`] = 0
      priceHist[i][`bbLower${period}`] = 0
    }
    return priceHist
  }

  for (let i = last + 1; i < len; i++) {
    priceHist[i][`bbUpper${period}`] = 0
    priceHist[i][`bbMid${period}`] = 0
    priceHist[i][`bbLower${period}`] = 0
  }

  const isWithSMA = priceHist[0].hasOwnProperty(`sma${period}`)
  if (!isWithSMA) getSMA(priceHist, period, priceKey)

  for (let i = 0; i <= last; i++) {
    const mean = priceHist[i][`sma${period}`] as number
    let sumSq = 0
    for (let j = i; j < i + period; j++) {
      const diff = (priceHist[j][priceKey] as number) - mean
      sumSq += diff * diff
    }
    const stddev = Math.sqrt(sumSq / period)
    priceHist[i][`bbUpper${period}`] = parseFloat((mean + k * stddev).toFixed(6))
    priceHist[i][`bbMid${period}`] = mean
    priceHist[i][`bbLower${period}`] = parseFloat((mean - k * stddev).toFixed(6))
  }

  if (!isWithSMA) {
    for (let i = 0; i < len; i++) delete priceHist[i][`sma${period}`]
  }

  return priceHist
}

export { getBB }
