import { PriceHistoryEntry, PriceKeys } from '../../types'

const getVWAP = (
  priceHist: PriceHistoryEntry[],
  period = 14,
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' },
  volumeKey = 'volume',
  setKey = 'vwap'
): PriceHistoryEntry[] => {
  const len = priceHist.length
  const last = len - period

  if (last < 0) {
    for (let i = 0; i < len; i++) priceHist[i][`${setKey}${period}`] = 0
    return priceHist
  }

  for (let i = last + 1; i < len; i++) priceHist[i][`${setKey}${period}`] = 0

  for (let i = 0; i <= last; i++) {
    let tpVolSum = 0
    let volSum = 0
    for (let j = i; j < i + period; j++) {
      const tp = ((priceHist[j][priceKeys.h] as number) + (priceHist[j][priceKeys.l] as number) + (priceHist[j][priceKeys.c] as number)) / 3
      const vol = (priceHist[j][volumeKey] as number) || 0
      tpVolSum += tp * vol
      volSum += vol
    }
    priceHist[i][`${setKey}${period}`] = volSum === 0
      ? parseFloat((((priceHist[i][priceKeys.h] as number) + (priceHist[i][priceKeys.l] as number) + (priceHist[i][priceKeys.c] as number)) / 3).toFixed(6))
      : parseFloat((tpVolSum / volSum).toFixed(6))
  }

  return priceHist
}

export { getVWAP }
