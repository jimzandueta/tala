# tala

**Technical Analysis Library for Assets** — a TypeScript library of stock indicators with zero runtime dependencies.

[![npm](https://img.shields.io/npm/v/@jimzandueta/tala)](https://www.npmjs.com/package/@jimzandueta/tala)
[![license](https://img.shields.io/npm/l/@jimzandueta/tala)](LICENSE)
[![types](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

---

## Features

- 25 indicators — moving averages, momentum, oscillators, pivot levels, cross signals
- Zero runtime dependencies
- Tree-shakeable ESM + CommonJS builds
- Full TypeScript types and declarations
- Consistent, predictable API across all indicators

## Install

```bash
npm install @jimzandueta/tala
```

## Quick Start

```typescript
import { getSMA, getEMA, getMACD, getRSI } from '@jimzandueta/tala'

// Prepare changeVal required by getRSI
history.forEach((h, i) => {
  h.changeVal = i < history.length - 1 ? h.close - history[i + 1].close : 0
})

getSMA(history, 14)      // → writes history[n].sma14
getEMA(history, 12)      // → writes history[n].ema12
getMACD(history, { fastPeriod: 12, slowPeriod: 26, signalLength: 9 }, {
  includeSignal: true,
  includeHistogram: true,
})                        // → writes history[n].macd, .signal, .histogram
getRSI(history, 14)      // → writes history[n].rsi14

console.log(history[0].sma14)   // most recent SMA
console.log(history[0].rsi14)   // most recent RSI (0–100)
```

## How It Works

All indicator functions share the same contract:

1. Accept `PriceHistoryEntry[]` where **index 0 is the most recent candle**
2. **Mutate** each entry in place, writing computed values
3. Return the same array

```typescript
import type { PriceHistoryEntry } from '@jimzandueta/tala'

interface PriceHistoryEntry {
  open: number
  high: number
  low: number
  close: number
  volume?: number
  changeVal?: number        // close[i] - close[i+1], required by getRSI
  [key: string]: number | undefined
}
```

Pass a copy if you need the original unchanged:

```typescript
const copy = history.map(e => ({ ...e }))
getSMA(copy, 14)
```

---

## API Reference

### Moving Averages

#### `getSMA(priceHist, period, priceKey?, setKey?)`

Simple Moving Average. Writes `sma{period}` (e.g. `sma14`).

```typescript
getSMA(history, 14)
// history[0].sma14 → number
```

#### `getEMA(priceHist, period, offset?, priceKey?, setKey?)`

Exponential Moving Average. Writes `ema{period}` (e.g. `ema12`).

```typescript
getEMA(history, 12)
// history[0].ema12 → number
```

#### `getWEMA(priceHist, period?, offset?, priceKey?, setKey?)`

Wilder's Exponential Moving Average. Writes `wema{period}`. Used internally by `getADX`.

#### `getALMA(priceHist, period?, sigma?, offset?, priceKey?)`

Arnaud Legoux Moving Average. Writes `alma`.

```typescript
getALMA(history)
// history[0].alma → number
```

#### `getTRIX(priceHist, period?, priceKey?, setKey?)`

Triple EMA Oscillator. Writes `trix`.

```typescript
getTRIX(history, 18)
// history[0].trix → number
```

---

### Momentum & Oscillators

#### `getMACD(priceHist, periods, options, priceKey?, setKey?)`

Writes `macd`, and optionally `signal` and `histogram`.

```typescript
const periods = { fastPeriod: 12, slowPeriod: 26, signalLength: 9 }

getMACD(history, periods, { includeSignal: true, includeHistogram: true })
// history[0].macd      → MACD line
// history[0].signal    → Signal line
// history[0].histogram → MACD − Signal
```

#### `getSignal(priceHist, periods, priceKey?)`

MACD Signal Line. Writes `signal`. Requires `getMACD` first.

#### `getHistogram(priceHist, periods, priceKey?)`

MACD Histogram. Writes `histogram`. Requires `getMACD` and `getSignal` first.

#### `getRSI(priceHist, period?, changeKey?, setKey?)`

Relative Strength Index. Writes `rsi{period}`. Values 0–100. Requires `changeVal` on each entry.

```typescript
history.forEach((h, i) => {
  h.changeVal = i < history.length - 1 ? h.close - history[i + 1].close : 0
})

getRSI(history, 14)
// history[0].rsi14 → 0–100
```

#### `getCCI(priceHist, period?, constant?, priceKeys?, setKey?)`

Commodity Channel Index. Writes `cci`.

```typescript
getCCI(history, 20)
// history[0].cci → number
```

#### `getADX(priceHist, period?, priceKeys?, setKey?)`

Average Directional Index. Writes `adx{period}`, and also `atr{period}`, `dmpS{period}`, `dmnS{period}`, `di+`, `di-`.

```typescript
getADX(history, 14)
// history[0].adx14 → 0–100
```

#### `getFisher(priceHist, period?, priceKeys?, setKeys?)`

Fisher Transform. Writes `fisherTransform` and `fisherSignal`.

```typescript
getFisher(history)
// history[0].fisherTransform → number
// history[0].fisherSignal    → number
```

#### `getSTS(priceHist, period?, priceKeys?, setKey?)`

Stochastic Oscillator. Writes `stsK` (%K) and `stsD3` (3-period SMA of %K). Values 0–100.

```typescript
getSTS(history)
// history[0].stsK  → %K (0–100)
// history[0].stsD3 → %D
```

#### `getWilliamsR(priceHist, period?, priceKeys?, setKey?)`

Williams %R. Writes `williamsR`. Range 0 to −1 (negated from the standard −100 to 0 scale).

```typescript
getWilliamsR(history)
// history[0].williamsR → 0 to -1
```

---

### Price Levels

#### `getPivotT(priceHist, period?, priceKeys?)`

Traditional Pivot Points. Writes `pp{period}`, `r1{period}`, `s1{period}`, `r2{period}`, `s2{period}`.

```typescript
getPivotT(history, 20)
// history[0].pp20 → Pivot Point
// history[0].r120 → Resistance 1
// history[0].s120 → Support 1
// history[0].r220 → Resistance 2
// history[0].s220 → Support 2
```

#### `getFibRL(priceHist, period?, priceKeys?)`

Fibonacci Retracement Levels. Requires `getPivotT` first. Writes `fib0.236`, `fib0.382`, `fib0.5`, `fib0.618`, `fib0.786`.

```typescript
getPivotT(history, 20)
getFibRL(history, 20)
// history[0]['fib0.5'] → midpoint fibonacci level
```

---

### Cross Signals

Cross functions return an array of **event candles** (not the full history). Each entry includes a `days` field — bars since the previous cross.

| Function | Triggers when |
|---|---|
| `getMACDCross(priceHist, periods?, priceKey?)` | MACD line crosses signal line |
| `getRSICross(priceHist, limits?, period?, changeKey?)` | RSI crosses threshold (default `[50, 55]`) |
| `getCCICross(priceHist, limit?, period?, constant?, priceKeys?)` | CCI crosses limit (default `100`) |
| `getALMACross(priceHist, period?, sigma?, offset?, priceKey?)` | Price crosses below ALMA |
| `getFisherCross(priceHist, period?, priceKeys?, setKeys?)` | Fisher Transform crosses signal |

```typescript
const crossEvents = getMACDCross(history)
// crossEvents[0].days → bars since previous cross
```

---

### Primitives

These write intermediate values used by higher-level indicators. Call them directly if you need the raw data.

| Function | Writes | Description |
|---|---|---|
| `getTP(priceHist, priceKeys?)` | `tp` | Typical Price `(high + low + close) / 3` |
| `getTR(priceHist, priceKeys?)` | `tr` | True Range |
| `getDM(priceHist, priceKeys?)` | `dmp`, `dmn` | Directional Movement (positive and negative) |

---

### Utilities

#### `getTrend(priceHist, key, start?, end?, isVector?)`

Returns `1` (uptrend), `-1` (downtrend), or `0` (sideways). Does **not** mutate the array.

```typescript
const direction = getTrend(history, 'close')
// 1 | -1 | 0
```

#### `expandMetric(value)`

Converts shorthand number strings to numeric values.

```typescript
import { expandMetric } from '@jimzandueta/tala'

expandMetric('1.5K')  // → 1500
expandMetric('2M')    // → 2000000
expandMetric('1.5B')  // → 1500000000
expandMetric('42.5')  // → 42.5
```

---

## License

ISC
