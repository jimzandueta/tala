import { PriceHistoryEntry } from '../../types'
import { getRSI } from './rsi'
import { getSMA } from '../trend/sma'

const getStochRSI = (
  priceHist: PriceHistoryEntry[],
  period = 14,
  changeKey = 'changeVal',
  kSetKey = 'stochRSIK',
  dSetKey = 'stochRSID'
): PriceHistoryEntry[] => {
  const len = priceHist.length
  const rsiKey = `rsi${period}`
  const isWithRSI = priceHist[0].hasOwnProperty(rsiKey)

  if (!isWithRSI) {
    priceHist.forEach((entry, i) => {
      if (entry.changeVal === undefined)
        entry.changeVal = i < len - 1 ? entry.close - priceHist[i + 1].close : 0
    })
    getRSI(priceHist, period, changeKey)
  }

  const rsiSeedIdx = len - 1 - period
  const stochLast = rsiSeedIdx - period + 1

  for (let i = Math.max(0, stochLast + 1); i < len; i++) {
    priceHist[i][kSetKey] = 0
  }

  if (stochLast >= 0) {
    for (let i = 0; i <= stochLast; i++) {
      let maxRSI = priceHist[i][rsiKey] as number
      let minRSI = priceHist[i][rsiKey] as number
      for (let j = i + 1; j < i + period; j++) {
        const v = priceHist[j][rsiKey] as number
        if (v > maxRSI) maxRSI = v
        if (v < minRSI) minRSI = v
      }
      const range = maxRSI - minRSI
      priceHist[i][kSetKey] = range === 0
        ? 0
        : parseFloat((((priceHist[i][rsiKey] as number) - minRSI) / range * 100).toFixed(4))
    }
  }

  priceHist = getSMA(priceHist, 3, kSetKey, dSetKey)

  if (!isWithRSI) {
    for (let i = 0; i < len; i++) delete priceHist[i][rsiKey]
    delete priceHist[0]['gAve']
    delete priceHist[0]['lAve']
  }

  return priceHist
}

export { getStochRSI }
