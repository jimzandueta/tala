import { ChartTerminal } from '../../src/chain/ChartTerminal'
import { runServer } from '../../src/viz/ServerRunner'

describe('ChartTerminal', () => {
  describe('constructor', () => {
    it('stores url when provided', () => {
      const terminal = new ChartTerminal({ url: 'http://localhost:7890' })
      expect(terminal.url).toBe('http://localhost:7890')
    })

    it('stores filePath when provided', () => {
      const terminal = new ChartTerminal({ filePath: '/tmp/chart.html' })
      expect(terminal.filePath).toBe('/tmp/chart.html')
    })
  })

  describe('close()', () => {
    it('closes the server when url is set', () => {
      const server = runServer(7896, '<html></html>', false)
      const terminal = new ChartTerminal({ url: 'http://localhost:7896', serverInstance: server })
      expect(() => terminal.close()).not.toThrow()
    })

    it('is a no-op when only filePath is set', () => {
      const terminal = new ChartTerminal({ filePath: '/tmp/chart.html' })
      expect(() => terminal.close()).not.toThrow()
    })
  })

  describe('chainability', () => {
    it('has no chain methods — sma, ema, run are undefined', () => {
      const terminal = new ChartTerminal({ filePath: '/tmp/chart.html' })
      expect((terminal as any).sma).toBeUndefined()
      expect((terminal as any).ema).toBeUndefined()
      expect((terminal as any).run).toBeUndefined()
      expect((terminal as any).chart).toBeUndefined()
    })
  })
})
