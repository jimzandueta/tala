/** Quick chart demo. */

import { tala } from '../src/chain/index'
import type { PriceHistoryEntry } from '../src/types'

/** Make fake OHLCV data (newest at index 0). */
function makeRealisticHistory(n: number): PriceHistoryEntry[] {
  const hist: PriceHistoryEntry[] = []
  let price = 150
  let trend = 0.2
  const now = Math.floor(Date.now() / 1000)

  for (let i = 0; i < n; i++) {
    trend += (Math.random() - 0.5) * 0.4
    trend = Math.max(-0.5, Math.min(0.5, trend))
    price += trend

    const open = price + (Math.random() - 0.5) * 2
    const close = price + (Math.random() - 0.5) * 2
    const high = Math.max(open, close) + Math.random() * 1.5
    const low = Math.min(open, close) - Math.random() * 1.5
    const volume = Math.floor(Math.random() * 10000) + 1000
    const timestamp = now - i * 3600 // 1h bars

    hist.push({ timestamp, open, high, low, close, volume })
  }
  return hist
}

const history = makeRealisticHistory(300)

async function main() {
  console.log('Generating chart with ALL indicators...')
  console.log('  (300 bars, hourly, ~12 days)')

  await tala()
    // overlays
    .sma(14)
    .ema(26)
    .wema(14)
    .alma(9)
    .trix(9)
    .bb(20, 2)
    .vwap(14)
    .atr(14)

    // oscillators
    .macd()
    .rsi(14)
    .cci(20)
    .williamsR(14)
    .sts(14)
    .fisher(14)
    .adx(14)
    .stochRSI(14)

    .chart(history, {
      format: 'html',
      filePath: './demo/test-chart.html',
      title: 'tala — ALL INDICATORS',
    })

  console.log('✅ Done — open test-chart.html in your browser')
  console.log('   See all indicator values in the sidebar legend')
  console.log('   Hover over a bar to see values at that point')
}

main().catch(console.error)
