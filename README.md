# tala

**Technical Analysis Library for Assets** — a TypeScript library of stock indicators with a fluent chain API, zero runtime dependencies, and dual CJS/ESM output.

[![build](https://github.com/jimzandueta/tala/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/jimzandueta/tala/actions/workflows/ci.yml)
[![version](https://img.shields.io/badge/version-2.0.0-blue)](https://github.com/jimzandueta/tala/tags)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![types](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

📖 **[Full documentation →](https://jimzandueta.github.io/tala/docs/)**

---

## Install

```bash
npm install @jimzandueta/tala
```

## Quick Start

```typescript
import { tala } from '@jimzandueta/tala'

const result = tala()
  .sma(14)
  .ema(12)
  .rsi(14)
  .macd({ fastPeriod: 12, slowPeriod: 26, signalLength: 9 }, { includeSignal: true })
  .run(history)

result[0].sma14   // most recent SMA-14
result[0].rsi14   // most recent RSI (0–100)
result[0].macd    // most recent MACD line
```

Cross/signal events with structured output:

```typescript
const { history: enriched, signals } = tala()
  .sma(14)
  .macdCross()
  .rsiCross()
  .run(history, { structured: true })

signals.macdCross  // PriceHistoryEntry[] of cross events
signals.rsiCross   // PriceHistoryEntry[] of cross events
```

## Indicators

| Category | Methods |
|---|---|
| Moving Averages | `.sma()` `.ema()` `.wema()` `.alma()` `.trix()` |
| Momentum | `.macd()` `.rsi()` `.cci()` `.adx()` `.fisher()` `.sts()` `.williamsR()` |
| Price Levels | `.pivotT()` `.fibRL()` |
| Cross Signals | `.macdCross()` `.rsiCross()` `.cciCross()` `.almaCross()` `.fisherCross()` |

See the **[full API reference](https://jimzandueta.github.io/tala/docs/)** for parameters, output keys, and examples.

## License

MIT
