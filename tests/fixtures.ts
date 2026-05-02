import { PriceHistoryEntry } from '../src/types'

/** Build a price history array. Index 0 = most recent candle. */
export function makeHistory(closes: number[]): PriceHistoryEntry[] {
  return closes.map(close => ({
    open: close,
    high: close + 1,
    low: close - 1,
    close,
  }))
}

/**
 * Build price history with changeVal pre-computed.
 * changeVal[i] = close[i] - close[i+1] (positive = price rose vs prior period).
 */
export function makeHistoryWithChangeVal(closes: number[]): PriceHistoryEntry[] {
  return closes.map((close, i) => ({
    open: close,
    high: close + 1,
    low: close - 1,
    close,
    changeVal: i < closes.length - 1 ? close - closes[i + 1] : undefined,
  }))
}

/**
 * Build a linear downtrend price history: closes = [start, start-step, start-2*step, ...].
 * Index 0 is most recent (highest price), index n-1 is oldest (lowest price).
 */
export function makeLinearHistory(n: number, start = 100, step = 1): PriceHistoryEntry[] {
  const closes = Array.from({ length: n }, (_, i) => start - i * step)
  return makeHistory(closes)
}

/**
 * Build a linear history with changeVal. changeVal[i] = +step for all entries except the oldest (undefined).
 */
export function makeLinearHistoryWithChangeVal(n: number, start = 100, step = 1): PriceHistoryEntry[] {
  const closes = Array.from({ length: n }, (_, i) => start - i * step)
  return makeHistoryWithChangeVal(closes)
}

/**
 * Build a price history that alternates between uptrend and downtrend segments.
 * Produces real crossover events for MACD, CCI, RSI cross indicators.
 */
export function makeOscillatingHistory(n: number, amplitude = 20, period = 15): PriceHistoryEntry[] {
  const closes = Array.from({ length: n }, (_, i) => {
    const cycle = Math.floor(i / period)
    const pos = i % period
    return cycle % 2 === 0
      ? 100 + (pos / period) * amplitude
      : 100 + amplitude - (pos / period) * amplitude
  })
  return makeHistory(closes)
}

/**
 * Build an oscillating price history with changeVal pre-computed.
 * Suitable for RSI cross tests that require alternating up/down moves.
 */
export function makeOscillatingHistoryWithChangeVal(n: number, amplitude = 20, period = 15): PriceHistoryEntry[] {
  const hist = makeOscillatingHistory(n, amplitude, period)
  return hist.map((entry, i) => ({
    ...entry,
    changeVal: i < hist.length - 1 ? entry.close - hist[i + 1].close : undefined,
  }))
}
