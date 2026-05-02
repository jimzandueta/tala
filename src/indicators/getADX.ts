import { PriceHistoryEntry, PriceKeys } from '../types'
import { getWEMA } from './getWEMA'
import { getTR } from './getTR'
import { getDM } from './getDM'

/**
 * Average Directional Index.
 * Writes `${setKey}${period}` (e.g. `adx14`) onto each entry, along with
 * intermediate keys `di+`, `di-`, `atr${period}`, `dmp`, `dmn`.
 * Depends on getTR and getDM (computed internally).
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param period - ADX period (default: 14).
 * @param priceKeys - OHLC field name mapping (default: `{ c: 'close', h: 'high', l: 'low' }`).
 * @param setKey - Prefix for the written ADX key (default: `'adx'`).
 * @returns The mutated `priceHist` array.
 */
const getADX = (
  priceHist: PriceHistoryEntry[],
  period = 14,
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' },
  setKey = 'adx'
): PriceHistoryEntry[] => {
  priceHist = getTR(priceHist)
  priceHist = getDM(priceHist)

  priceHist = getWEMA(priceHist, period, 0, 'tr', 'atr')
  priceHist = getWEMA(priceHist, period, 0, 'dmp', 'dmpS')
  priceHist = getWEMA(priceHist, period, 0, 'dmn', 'dmnS')

  for (let i = 0; i < priceHist.length; i++) {
    if (i <= priceHist.length - period) {
      priceHist[i]['di+'] = ((priceHist[i][`dmpS${period}`] as number) / (priceHist[i][`atr${period}`] as number)) * 100
      priceHist[i]['di-'] = ((priceHist[i][`dmnS${period}`] as number) / (priceHist[i][`atr${period}`] as number)) * 100
      priceHist[i]['dx'] = (Math.abs((priceHist[i]['di+'] as number) - (priceHist[i]['di-'] as number)) / Math.abs((priceHist[i]['di+'] as number) + (priceHist[i]['di-'] as number))) * 100
    }
  }

  priceHist = getWEMA(priceHist, period, 2 * period, 'dx', setKey)

  for (let i = 0; i < priceHist.length; i++) {
    delete priceHist[i][`tr${period}`]
    delete priceHist[i][`dmn${period}`]
    delete priceHist[i][`dmp${period}`]
    delete priceHist[i][`dx${period}`]
  }

  return priceHist
}

export { getADX }
