import { makeLinearHistory } from '../fixtures'
import { LightweightChartAdapter } from '../../src/viz/LightweightChartAdapter'
import { HtmlRenderer } from '../../src/viz/HtmlRenderer'

describe('HtmlRenderer', () => {
  describe('render()', () => {
    it('returns a string containing <!DOCTYPE html>', () => {
      const hist = makeLinearHistory(20)
      const adapter = new LightweightChartAdapter(hist)
      const renderer = new HtmlRenderer(adapter, { title: 'Test Chart' })
      const html = renderer.render()
      expect(html).toContain('<!DOCTYPE html>')
    })

    it('includes the chart title in the header', () => {
      const hist = makeLinearHistory(20)
      const adapter = new LightweightChartAdapter(hist)
      const renderer = new HtmlRenderer(adapter, { title: 'My SMA Chart' })
      const html = renderer.render()
      expect(html).toContain('My SMA Chart')
    })

    it('includes Download PNG button', () => {
      const hist = makeLinearHistory(20)
      const adapter = new LightweightChartAdapter(hist)
      const renderer = new HtmlRenderer(adapter, {})
      const html = renderer.render()
      expect(html).toContain('Download PNG')
      expect(html).toContain('downloadChart()')
    })

    it('includes lightweight-charts CDN script', () => {
      const hist = makeLinearHistory(20)
      const adapter = new LightweightChartAdapter(hist)
      const renderer = new HtmlRenderer(adapter, {})
      const html = renderer.render()
      expect(html).toContain('cdn.jsdelivr.net/npm/lightweight-charts')
    })

    it('includes main-chart container div', () => {
      const hist = makeLinearHistory(20)
      const adapter = new LightweightChartAdapter(hist)
      const renderer = new HtmlRenderer(adapter, {})
      const html = renderer.render()
      expect(html).toContain('main-chart-inner')
    })

    it('includes oscillator containers when oscillators are detected', () => {
      const hist = makeLinearHistory(60)
      hist.forEach(h => {
        ;(h as any).macd = 1
        ;(h as any).rsi14 = 50
      })
      const adapter = new LightweightChartAdapter(hist)
      const renderer = new HtmlRenderer(adapter, {})
      const html = renderer.render()
      expect(html).toContain('oscillator-panes')
    })

    it('uses pp color mapping for pivot overlay legend', () => {
      const hist = makeLinearHistory(80)
      hist.forEach(h => {
        ;(h as any).pp20 = 100
      })
      const adapter = new LightweightChartAdapter(hist)
      const renderer = new HtmlRenderer(adapter, {})
      const html = renderer.render()
      expect(html).toContain("pp: '#ff9800'")
      expect(html).not.toContain("pivotPoint: '#ff9800'")
    })
  })
})
