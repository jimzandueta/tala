# Demo: tala chart visualization

Use this to run tala's `chart()` output and inspect an interactive TradingView-style chart with all supported indicators.

## Prerequisites

- Node.js 18+
- `npm install` at the project root

## Quick start

```bash
cd demo/
npx tsx test-viz.ts
```

This writes `test-chart.html` in `demo/`. Open it in your browser.

For a live server that auto-opens your browser:

```bash
cd demo/
npx tsx test-server.ts
```

## Chart contents

- **Main chart**: Candlesticks with SMA, EMA, WEMA, ALMA, TRIX, Bollinger Bands, VWAP, and ATR
- **Oscillator pane 1**: RSI, ADX, Stochastic (0-100 range)
- **Oscillator pane 2**: MACD, Williams %R, Fisher Transform (around zero)
- **Oscillator pane 3**: CCI (wide range)
- **Sidebar**: Legend with toggle switches for each indicator
- **Hover**: Per-pane tooltips showing OHLC and indicator values
- **Download**: Export all charts as a single PNG

## Using in your own code

```typescript
import { tala } from '@jimzandueta/tala'
import type { PriceHistoryEntry } from '@jimzandueta/tala'

const history: PriceHistoryEntry[] = [
  { open: 100, high: 102, low: 99, close: 101, volume: 1000 },
  // ...
]

tala()
  .sma(14)
  .rsi(14)
  .macd()
  .chart(history, { format: 'html', filePath: './my-chart.html' })
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `format` | `'server'` | `'html'` writes a file, `'server'` starts a local HTTP server |
| `filePath` | `'./demo/tala-chart.html'` | Output path for HTML format |
| `port` | `7890` | Port for server mode |
| `title` | `'tala chart'` | Chart title |

## Notes

- Generated `.html` files are gitignored - they are build artifacts
- The chart requires a browser to render (it's a client-side HTML file)
