import { PriceHistoryEntry, PriceKeys, FisherSetKeys } from '../../types'

/**
 * Fisher Transform.
 * Converts price into a Gaussian normal distribution.
 * Writes `${setKeys.t}` (transform) and `${setKeys.s}` (signal, which is the
 * previous bar's transform) onto each entry.
 * Default output keys: `fisherTransform` and `fisherSignal`.
 *
 * @param priceHist - Price history array; index 0 is the most recent candle.
 * @param period - Lookback window for HL2 high/low range (default: 9).
 * @param priceKeys - OHLC field name mapping (default: `{ c: 'close', h: 'high', l: 'low' }`).
 * @param setKeys - Output key names (default: `{ t: 'fisherTransform', s: 'fisherSignal' }`).
 * @returns The mutated `priceHist` array.
 */
const getFisher = (
  priceHist: PriceHistoryEntry[],
  period = 9,
  priceKeys: PriceKeys = { c: 'close', h: 'high', l: 'low' },
  setKeys: FisherSetKeys = { t: 'fisherTransform', s: 'fisherSignal' }
): PriceHistoryEntry[] => {
  const hl2Arr: number[] = []
  let sto = 0
  for (let i = 0; i < priceHist.length; i++) {
    priceHist[i]['hl2'] = ((priceHist[i][priceKeys.h] as number) + (priceHist[i][priceKeys.l] as number)) / 2
    hl2Arr.push(priceHist[i]['hl2'] as number)
  }
  for (let i = 0; i < priceHist.length; i++) {
    const arr = hl2Arr.slice(i, i + period)
    priceHist[i]['hlMax'] = Math.max(...arr)
    priceHist[i]['hlMin'] = Math.min(...arr)
  }
  for (let i = priceHist.length - 1; i >= 0; i--) {
    if (i === priceHist.length - 1) {
      priceHist[i]['fish'] = 0.0
      priceHist[i][setKeys.t] = 0.0
    } else {
      sto = (priceHist[i]['hlMax'] as number) - (priceHist[i]['hlMin'] as number) !== 0
        ? ((priceHist[i]['hl2'] as number) - (priceHist[i]['hlMin'] as number)) / ((priceHist[i]['hlMax'] as number) - (priceHist[i]['hlMin'] as number))
        : 0
      priceHist[i]['fish'] = Math.max(Math.min((0.33 * 2 * (sto - 0.5)) + (0.67 * (priceHist[i + 1]['fish'] as number)), 0.999), -0.999)
      priceHist[i][setKeys.t] = (0.5 * Math.log((1 + (priceHist[i]['fish'] as number)) / (1 - (priceHist[i]['fish'] as number)))) + (0.5 * (priceHist[i + 1][setKeys.t] as number))
      priceHist[i][setKeys.s] = priceHist[i + 1][setKeys.t] as number
    }
  }
  return priceHist
}

export { getFisher }
