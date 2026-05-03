import { PriceHistoryEntry } from '../../types'

const getOBV = (
  priceHist: PriceHistoryEntry[],
  priceKey = 'close',
  volumeKey = 'volume',
  setKey = 'obv'
): PriceHistoryEntry[] => {
  const len = priceHist.length
  priceHist[len - 1][setKey] = 0
  for (let i = len - 2; i >= 0; i--) {
    const vol = (priceHist[i][volumeKey] as number) || 0
    const prevOBV = priceHist[i + 1][setKey] as number
    const curClose = priceHist[i][priceKey] as number
    const prevClose = priceHist[i + 1][priceKey] as number
    if (curClose > prevClose) {
      priceHist[i][setKey] = prevOBV + vol
    } else if (curClose < prevClose) {
      priceHist[i][setKey] = prevOBV - vol
    } else {
      priceHist[i][setKey] = prevOBV
    }
  }
  return priceHist
}

export { getOBV }
