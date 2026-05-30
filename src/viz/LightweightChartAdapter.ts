import type { PriceHistoryEntry } from '../types'

export class LightweightChartAdapter {
  private history: PriceHistoryEntry[]
  private overlays: Array<{ key: string; seriesType: 'line' | 'bbUpper' | 'bbLower' }> = []
  private oscillators: Array<{ key: string; seriesType: 'line' | 'histogram' }> = []

  constructor(history: PriceHistoryEntry[]) {
    if (!history || history.length === 0) {
      throw new Error('history must contain at least 1 entry')
    }
    this.history = history
    this.buildSeriesMap()
  }

  private buildSeriesMap(): void {
    // Scan a few rows; warm-up can hide keys
    const scanLimit = Math.min(5, this.history.length)
    const allKeys = new Set<string>()
    for (let si = 0; si < scanLimit; si++) {
      Object.keys(this.history[si]).forEach(k => allKeys.add(k))
    }

    // Match real data key (sma14, fib0.5, stsK14, ...)
    const findDataKey = (prefix: string): string | null => {
      const aliases = prefix === 'pivotPoint' ? ['pivotPoint', 'pp'] : [prefix]
      // exact, numeric suffix, decimal suffix, or alpha+numeric suffix
      const patterns = aliases.flatMap(alias => [
        (k: string) => k === alias,
        (k: string) => new RegExp('^' + alias + '\\d*\\.?\\d+$').test(k),
        (k: string) => new RegExp('^' + alias + '[a-zA-Z]\\d+$').test(k),
      ])
      const matches = Array.from(allKeys).filter(k => patterns.some(p => p(k)))
      return matches[0] || null
    }

    const overlayCandidates = [
      { prefix: 'sma', seriesType: 'line' as const },
      { prefix: 'ema', seriesType: 'line' as const },
      { prefix: 'wema', seriesType: 'line' as const },
      { prefix: 'alma', seriesType: 'line' as const },
      { prefix: 'trix', seriesType: 'line' as const },
      { prefix: 'atr', seriesType: 'line' as const },
      { prefix: 'vwap', seriesType: 'line' as const },
      { prefix: 'bbUpper', seriesType: 'bbUpper' as const },
      { prefix: 'bbLower', seriesType: 'bbLower' as const },
      { prefix: 'pp', seriesType: 'line' as const },
      { prefix: 'fib', seriesType: 'line' as const },
    ]
    for (const candidate of overlayCandidates) {
      const dataKey = findDataKey(candidate.prefix)
      if (dataKey) {
        this.overlays.push({ key: dataKey, seriesType: candidate.seriesType })
      }
    }

    const oscillatorCandidates = [
      { prefix: 'rsi', seriesType: 'line' as const },
      { prefix: 'macd', seriesType: 'line' as const },
      { prefix: 'signal', seriesType: 'line' as const },
      { prefix: 'histogram', seriesType: 'histogram' as const },
      { prefix: 'cci', seriesType: 'line' as const },
      { prefix: 'adx', seriesType: 'line' as const },
      { prefix: 'williamsR', seriesType: 'line' as const },
      { prefix: 'stsK', seriesType: 'line' as const },
      { prefix: 'stsD3', seriesType: 'line' as const },
      { prefix: 'fisherTransform', seriesType: 'line' as const },
      { prefix: 'stochRSI', seriesType: 'line' as const },
    ]
    for (const candidate of oscillatorCandidates) {
      const dataKey = findDataKey(candidate.prefix)
      if (dataKey) {
        this.oscillators.push({ key: dataKey, seriesType: candidate.seriesType })
      }
    }
  }

  /** Timestamp or index fallback */
  private timeFor(entry: PriceHistoryEntry, index: number): number {
    return (entry.timestamp !== undefined ? entry.timestamp : index) as number
  }

  getCandlestickData(): Array<{ time: number; open: number; high: number; low: number; close: number }> {
    return [...this.history].reverse().map((entry, i) => ({
      time: this.timeFor(entry, i),
      open: entry.open,
      high: entry.high,
      low: entry.low,
      close: entry.close,
    }))
  }

  getLineData(key: string): Array<{ time: number; value: number }> {
    return [...this.history].reverse().map((entry, i) => ({
      time: this.timeFor(entry, i),
      value: entry[key] as number,
    }))
  }

  getHistogramData(key: string): Array<{ time: number; value: number; color: string }> {
    return [...this.history].reverse().map((entry, i) => ({
      time: this.timeFor(entry, i),
      value: entry[key] as number,
      color: (entry[key] as number) >= 0 ? '#26a69a' : '#ef5350',
    }))
  }

  getOverlayKeys(): Array<{ key: string; seriesType: 'line' | 'bbUpper' | 'bbLower' }> {
    return this.overlays
  }

  getOscillatorKeys(): Array<{ key: string; seriesType: 'line' | 'histogram' }> {
    return this.oscillators
  }

  getHistory(): PriceHistoryEntry[] {
    return this.history
  }
}
