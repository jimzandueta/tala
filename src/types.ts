/** A single OHLCV candle. Index 0 = most recent candle in all indicator arrays. */
export interface PriceHistoryEntry {
  open: number
  high: number
  low: number
  close: number
  /** Trading volume */
  volume?: number
  /** close[i] - close[i+1]; required by getRSI */
  changeVal?: number
  /** Dynamic computed properties written by indicators (e.g. ema12, sma26, rsi14) */
  [key: string]: number | undefined
}

/** OHLC field name mapping for indicators that accept custom price key names */
export interface PriceKeys {
  c: string
  h: string
  l: string
}

/** Period configuration for MACD-family indicators */
export interface MACDPeriods {
  fastPeriod?: number
  slowPeriod?: number
  signalLength?: number
}

/** Output options for getMACD */
export interface MACDOptions {
  /** Compute and attach signal line to history entries */
  includeSignal?: boolean
  /** Compute and attach histogram (MACD - signal) to history entries */
  includeHistogram?: boolean
}

/** Custom output key names for Stochastic indicator */
export interface STSSetKey {
  k: string
  d: string
}

/** Custom output key names for Fisher Transform */
export interface FisherSetKeys {
  t: string
  s: string
}

/** Structured output from TalaChain.run() when { structured: true } is passed */
export interface TalaResult {
  history: PriceHistoryEntry[]
  signals: Record<string, PriceHistoryEntry[]>
}

/** Options for TalaChain.run() */
export interface RunOptions {
  structured?: boolean
}
