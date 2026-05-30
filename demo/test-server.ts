/** Local server chart demo. */

import { tala } from '../src/chain/index'
import type { PriceHistoryEntry } from '../src/types'

function makeData(n: number): PriceHistoryEntry[] {
  const hist: PriceHistoryEntry[] = []
  let price = 150
  let trend = 0.2
  const now = Math.floor(Date.now() / 1000)

  for (let i = 0; i < n; i++) {
    trend += (Math.random() - 0.5) * 0.4
    trend = Math.max(-0.5, Math.min(0.5, trend))
    price += trend

    hist.push({
      timestamp: now - i * 3600,
      open: price + (Math.random() - 0.5) * 2,
      high: price + Math.random() * 2,
      low: price - Math.random() * 2,
      close: price + (Math.random() - 0.5) * 2,
      volume: Math.floor(Math.random() * 10000) + 1000,
    })
  }
  return hist
}

async function main() {
  const history = makeData(200)
  console.log('Starting chart server at http://localhost:7890')

  const terminal = await tala()
    .sma(14)
    .ema(26)
    .bb(20, 2)
    .macd()
    .rsi(14)
    .chart(history, { format: 'server', port: 7890 })

  console.log('Press Ctrl+C to stop')
  process.on('SIGINT', () => {
    terminal.close()
    process.exit(0)
  })
}

main().catch(console.error)
