import { PriceHistoryEntry, PriceKeys } from '../../types'
import { getTR } from './tr'
import { getWEMA } from '../trend/wema'

const getATR = (
  priceHist: PriceHistoryEntry[],
  period = 14,
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' },
  setKey = 'atr'
): PriceHistoryEntry[] => {
  priceHist = getTR(priceHist, priceKeys)
  priceHist = getWEMA(priceHist, period, 0, 'tr', setKey)
  return priceHist
}

export { getATR }
