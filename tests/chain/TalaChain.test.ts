import { tala } from '../../src/chain'
import { makeHistory, makeLinearHistory, makeOscillatingHistory } from '../fixtures'

describe('TalaChain', () => {
  describe('run() — core behavior', () => {
    it('returns an array', () => {
      const result = tala().run(makeHistory([10, 20, 30]))
      expect(Array.isArray(result)).toBe(true)
    })

    it('does not mutate the original history', () => {
      const history = makeHistory([10, 20, 30])
      const original = history.map(h => ({ ...h }))
      tala().sma(2).run(history)
      history.forEach((entry, i) => {
        expect(entry).toEqual(original[i])
      })
    })

    it('is reusable — same chain produces identical results on same data', () => {
      const chain = tala().sma(3)
      const histA = makeLinearHistory(10)
      const histB = makeLinearHistory(10)
      const resultA = chain.run(histA)
      const resultB = chain.run(histB)
      expect(resultA[0].sma3).toEqual(resultB[0].sma3)
    })

    it('run() without structured flag returns PriceHistoryEntry[]', () => {
      const result = tala().run(makeHistory([10, 20, 30]))
      expect(Array.isArray(result)).toBe(true)
    })

    it('run({ structured: true }) returns { history, signals }', () => {
      const result = tala().run(makeHistory([10, 20, 30]), { structured: true })
      expect(result).toHaveProperty('history')
      expect(result).toHaveProperty('signals')
    })

    it('signal ops do not execute without { structured: true }', () => {
      let signalOpCalled = false
      const chain = tala()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(chain as any).signalOps.push(() => {
        signalOpCalled = true
        return { key: 'test', events: [] }
      })
      chain.run(makeHistory([10, 20, 30]))
      expect(signalOpCalled).toBe(false)
    })
  })

  describe('indicator methods — output key written', () => {
    it('.sma(14) writes sma14', () => {
      const result = tala().sma(14).run(makeLinearHistory(20))
      expect(typeof result[0].sma14).toBe('number')
    })

    it('.ema(12) writes ema12', () => {
      const result = tala().ema(12).run(makeLinearHistory(20))
      expect(typeof result[0].ema12).toBe('number')
    })

    it('.rsi(14) writes rsi14 without manual changeVal on input', () => {
      const history = makeLinearHistory(30)
      history.forEach(h => expect(h.changeVal).toBeUndefined())
      const result = tala().rsi(14).run(history)
      expect(typeof result[0].rsi14).toBe('number')
    })

    it('.rsi(14) does not leave changeVal on the original history', () => {
      const history = makeLinearHistory(30)
      tala().rsi(14).run(history)
      expect(history[0].changeVal).toBeUndefined()
    })

    it('.macd() writes macd key', () => {
      const result = tala().macd().run(makeLinearHistory(50))
      expect(typeof result[0].macd).toBe('number')
    })

    it('.macd() with includeSignal writes signal key', () => {
      const result = tala().macd({}, { includeSignal: true }).run(makeLinearHistory(60))
      expect(typeof result[0].signal).toBe('number')
    })

    it('.alma() writes alma', () => {
      const result = tala().alma().run(makeLinearHistory(20))
      expect(typeof result[0].alma).toBe('number')
    })

    it('.trix() writes trix key', () => {
      const result = tala().trix().run(makeLinearHistory(80))
      expect(typeof result[0].trix).toBe('number')
    })

    it('.cci() writes cci key', () => {
      const result = tala().cci().run(makeLinearHistory(50))
      expect(typeof result[0].cci).toBe('number')
    })

    it('.williamsR() writes williamsR key', () => {
      const result = tala().williamsR().run(makeLinearHistory(30))
      expect(typeof result[0].williamsR).toBe('number')
    })

    it('.sts() writes stsK and stsD3 keys', () => {
      const result = tala().sts().run(makeLinearHistory(40))
      expect(typeof result[0].stsK).toBe('number')
      expect(typeof result[0].stsD3).toBe('number')
    })

    it('.fisher() writes fisherTransform key', () => {
      const result = tala().fisher().run(makeLinearHistory(30))
      expect(typeof result[0].fisherTransform).toBe('number')
    })

    it('.adx() writes adx14 key', () => {
      const result = tala().adx().run(makeLinearHistory(60))
      expect(typeof result[0].adx14).toBe('number')
    })

    it('.wema(14, 0) writes wema14 key', () => {
      const result = tala().wema(14, 0).run(makeLinearHistory(40))
      expect(typeof result[0].wema14).toBe('number')
    })

    it('.pivotT() writes pp20 key', () => {
      const result = tala().pivotT().run(makeLinearHistory(80))
      expect(typeof result[0].pp20).toBe('number')
    })

    it('.fibRL() writes fib0.5 key', () => {
      const result = tala().fibRL().run(makeLinearHistory(80))
      expect(Object.prototype.hasOwnProperty.call(result[0], 'fib0.5')).toBe(true)
    })
  })

  describe('signal methods — structured output', () => {
    it('.macdCross() populates signals.macdCross in structured mode', () => {
      const { history, signals } = tala()
        .macdCross()
        .run(makeOscillatingHistory(120), { structured: true })
      expect(Array.isArray(history)).toBe(true)
      expect(Array.isArray(signals.macdCross)).toBe(true)
    })

    it('.rsiCross() populates signals.rsiCross in structured mode', () => {
      const { signals } = tala()
        .rsiCross()
        .run(makeOscillatingHistory(120), { structured: true })
      expect(Array.isArray(signals.rsiCross)).toBe(true)
    })

    it('.cciCross() populates signals.cciCross in structured mode', () => {
      const { signals } = tala()
        .cciCross()
        .run(makeOscillatingHistory(120), { structured: true })
      expect(Array.isArray(signals.cciCross)).toBe(true)
    })

    it('.almaCross() populates signals.almaCross in structured mode', () => {
      const { signals } = tala()
        .almaCross()
        .run(makeOscillatingHistory(120), { structured: true })
      expect(Array.isArray(signals.almaCross)).toBe(true)
    })

    it('.fisherCross() populates signals.fisherCross in structured mode', () => {
      const { signals } = tala()
        .fisherCross()
        .run(makeOscillatingHistory(120), { structured: true })
      expect(Array.isArray(signals.fisherCross)).toBe(true)
    })

    it('multiple signals coexist in structured output', () => {
      const { signals } = tala()
        .macdCross()
        .rsiCross()
        .run(makeOscillatingHistory(150), { structured: true })
      expect(signals).toHaveProperty('macdCross')
      expect(signals).toHaveProperty('rsiCross')
    })
  })

  describe('chart() — terminal method', () => {
    it('chart() is a function on TalaChain', () => {
      const chain = tala()
      expect(typeof chain.chart).toBe('function')
    })

    it('chart() returns a ChartTerminal with filePath for html format', async () => {
      const mockHistory = makeLinearHistory(20)
      jest.mock('../../src/viz/LightweightChartAdapter', () => ({
        LightweightChartAdapter: jest.fn().mockImplementation(() => ({
          getHistory: () => mockHistory,
          getOverlayKeys: () => [],
          getOscillatorKeys: () => [],
        })),
      }))
      jest.mock('../../src/viz/HtmlRenderer', () => ({
        HtmlRenderer: jest.fn().mockImplementation(() => ({
          render: () => '<html></html>',
        })),
      }))

      const { tala } = await import('../../src/chain')
      const terminal = await tala().sma(14).chart(mockHistory, { format: 'html' })
      expect(terminal).toHaveProperty('filePath')
    })

    it('chart() is not chainable — sma/ema/run are undefined on return value', async () => {
      const mockHistory = makeLinearHistory(20)
      jest.mock('../../src/viz/LightweightChartAdapter', () => ({
        LightweightChartAdapter: jest.fn().mockImplementation(() => ({
          getHistory: () => mockHistory,
          getOverlayKeys: () => [],
          getOscillatorKeys: () => [],
        })),
      }))
      jest.mock('../../src/viz/HtmlRenderer', () => ({
        HtmlRenderer: jest.fn().mockImplementation(() => ({
          render: () => '<html></html>',
        })),
      }))

      const { tala } = await import('../../src/chain')
      const terminal = await tala().sma(14).chart(mockHistory, { format: 'html' })
      expect((terminal as any).sma).toBeUndefined()
      expect((terminal as any).ema).toBeUndefined()
      expect((terminal as any).run).toBeUndefined()
    })

    it('rejects filePath outside current working directory', async () => {
      const mockHistory = makeLinearHistory(20)
      jest.mock('../../src/viz/LightweightChartAdapter', () => ({
        LightweightChartAdapter: jest.fn().mockImplementation(() => ({
          getHistory: () => mockHistory,
          getOverlayKeys: () => [],
          getOscillatorKeys: () => [],
        })),
      }))
      jest.mock('../../src/viz/HtmlRenderer', () => ({
        HtmlRenderer: jest.fn().mockImplementation(() => ({
          render: () => '<html></html>',
        })),
      }))

      const { tala } = await import('../../src/chain')
      await expect(
        tala().sma(14).chart(mockHistory, { format: 'html', filePath: '/etc/passwd' })
      ).rejects.toThrow('filePath must be within the current working directory')
    })

    it('rejects filePath without .html extension', async () => {
      const mockHistory = makeLinearHistory(20)
      jest.mock('../../src/viz/LightweightChartAdapter', () => ({
        LightweightChartAdapter: jest.fn().mockImplementation(() => ({
          getHistory: () => mockHistory,
          getOverlayKeys: () => [],
          getOscillatorKeys: () => [],
        })),
      }))
      jest.mock('../../src/viz/HtmlRenderer', () => ({
        HtmlRenderer: jest.fn().mockImplementation(() => ({
          render: () => '<html></html>',
        })),
      }))

      const { tala } = await import('../../src/chain')
      await expect(
        tala().sma(14).chart(mockHistory, { format: 'html', filePath: 'test' })
      ).rejects.toThrow('filePath must end with .html')
    })
  })
})
