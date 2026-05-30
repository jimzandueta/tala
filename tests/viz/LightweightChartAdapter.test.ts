import { makeLinearHistory, makeHistoryWithChangeVal } from '../fixtures'
import { LightweightChartAdapter } from '../../src/viz/LightweightChartAdapter'

describe('LightweightChartAdapter', () => {
  describe('constructor', () => {
    it('throws if history is empty', () => {
      expect(() => new LightweightChartAdapter([])).toThrow('history must contain at least 1 entry')
    })

    it('throws if history is undefined', () => {
      expect(() => new LightweightChartAdapter(undefined as any)).toThrow('history must contain at least 1 entry')
    })
  })

  describe('getCandlestickData()', () => {
    it('reverses history so oldest entry comes first', () => {
      const hist = makeLinearHistory(5)
      const adapter = new LightweightChartAdapter(hist)
      const data = adapter.getCandlestickData()
      expect(data[0].close).toBe(96)
      expect(data[data.length - 1].close).toBe(100)
    })

    it('includes open, high, low, close', () => {
      const hist = makeLinearHistory(3)
      const adapter = new LightweightChartAdapter(hist)
      const data = adapter.getCandlestickData()
      expect(data[0]).toHaveProperty('open')
      expect(data[0]).toHaveProperty('high')
      expect(data[0]).toHaveProperty('low')
      expect(data[0]).toHaveProperty('close')
    })
  })

  describe('getLineData()', () => {
    it('returns array of { time, value } objects', () => {
      const hist = makeLinearHistory(10)
      const adapter = new LightweightChartAdapter(hist)
      const lineData = adapter.getLineData('sma14')
      expect(Array.isArray(lineData)).toBe(true)
      expect(lineData[0]).toHaveProperty('time')
      expect(lineData[0]).toHaveProperty('value')
    })

    it('returns array of length equal to history length', () => {
      const hist = makeLinearHistory(10)
      const adapter = new LightweightChartAdapter(hist)
      const lineData = adapter.getLineData('nonexistentKey')
      expect(lineData).toHaveLength(10)
    })
  })

  describe('getHistogramData()', () => {
    it('returns { time, value, color } objects', () => {
      const hist = makeLinearHistory(5)
      const adapter = new LightweightChartAdapter(hist)
      const histData = adapter.getHistogramData('histogram')
      expect(histData[0]).toHaveProperty('time')
      expect(histData[0]).toHaveProperty('value')
      expect(histData[0]).toHaveProperty('color')
    })
  })

  describe('buildSeriesMap — overlay detection', () => {
    it('detects sma prefix when sma14 is present in history', () => {
      const hist = makeLinearHistory(20)
      hist.forEach(h => { (h as any).sma14 = 100 })
      const adapter = new LightweightChartAdapter(hist)
      const overlays = adapter.getOverlayKeys()
      expect(overlays.some((o: { key: string }) => o.key === 'sma14')).toBe(true)
    })

    it('does not detect sma when no sma keys are present', () => {
      const hist = makeLinearHistory(20)
      const adapter = new LightweightChartAdapter(hist)
      const overlays = adapter.getOverlayKeys()
      expect(overlays.some((o: { key: string }) => o.key === 'sma')).toBe(false)
    })

    it('detects pp prefix when pp20 is present in history', () => {
      const hist = makeLinearHistory(80)
      hist.forEach(h => {
        ;(h as any).pp20 = 100
      })
      const adapter = new LightweightChartAdapter(hist)
      const overlays = adapter.getOverlayKeys()
      expect(overlays.some((o: { key: string }) => o.key === 'pp20')).toBe(true)
    })
  })

  describe('buildSeriesMap — oscillator detection', () => {
    it('detects rsi prefix when rsi14 is present in history', () => {
      const hist = makeHistoryWithChangeVal([...Array(30)].map((_, i) => 100 - i))
      hist.forEach(h => { (h as any).rsi14 = 50 })
      const adapter = new LightweightChartAdapter(hist)
      const oscillators = adapter.getOscillatorKeys()
      expect(oscillators.some((o: { key: string }) => o.key === 'rsi14')).toBe(true)
    })

    it('detects macd key (exact match)', () => {
      const hist = makeLinearHistory(50)
      hist.forEach(h => { (h as any).macd = 1 })
      const adapter = new LightweightChartAdapter(hist)
      const oscillators = adapter.getOscillatorKeys()
      expect(oscillators.some((o: { key: string }) => o.key === 'macd')).toBe(true)
    })
  })
})
