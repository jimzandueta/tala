import type { ChartOptions, ChartResult, OverlayIndicatorKeys, OscillatorIndicatorKeys } from '../../src/viz/types'

describe('viz types', () => {
  it('ChartOptions has correct shape', () => {
    const opts: ChartOptions = {
      format: 'html',
      filePath: './chart.html',
      port: 3000,
      title: 'My Chart',
    }
    expect(opts.format).toBe('html')
    expect(opts.filePath).toBe('./chart.html')
    expect(opts.port).toBe(3000)
    expect(opts.title).toBe('My Chart')
  })

  it('ChartResult has optional url', () => {
    const result: ChartResult = { url: 'http://localhost:7890' }
    expect(result.url).toBe('http://localhost:7890')
  })

  it('ChartResult has optional filePath', () => {
    const result: ChartResult = { filePath: '/tmp/chart.html' }
    expect(result.filePath).toBe('/tmp/chart.html')
  })

  it('OverlayIndicatorKeys includes sma, ema, bb, etc.', () => {
    const keys: OverlayIndicatorKeys[] = ['sma', 'ema', 'wema', 'alma', 'trix', 'atr', 'vwap', 'bbUpper', 'bbLower', 'pivotPoint', 'fib']
    expect(keys).toContain('sma')
    expect(keys).toContain('ema')
    expect(keys).toContain('bbUpper')
  })

  it('OscillatorIndicatorKeys includes rsi, macd, etc.', () => {
    const keys: OscillatorIndicatorKeys[] = ['rsi', 'macd', 'macdSignal', 'histogram', 'cci', 'adx', 'williamsR', 'stsK', 'stsD3', 'fisherTransform', 'stochRSI']
    expect(keys).toContain('rsi')
    expect(keys).toContain('macd')
    expect(keys).toContain('histogram')
  })
})
