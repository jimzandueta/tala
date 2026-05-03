# Changelog

All notable changes to `@jimzandueta/tala` are documented here.

---

## [2.1.0] — 2026-05-03

### Added

- **Bollinger Bands** — `.bb(period?, k?, priceKey?)`. Writes `bbUpper{period}`, `bbMid{period}`, `bbLower{period}`. Default period=20, k=2.
- **ATR** (Average True Range) — `.atr(period?, priceKeys?, setKey?)`. Standalone WEMA of True Range. Writes `atr{period}`. Default period=14.
- **Stochastic RSI** — `.stochRSI(period?, changeKey?, kSetKey?, dSetKey?)`. Applies Stochastic formula to RSI series. Writes `stochRSIK` (0–100) and `stochRSID3` (3-bar SMA signal line). Default period=14. `changeVal` auto-computed if missing.
- **OBV** (On-Balance Volume) — `.obv(priceKey?, volumeKey?, setKey?)`. Cumulative volume signed by price direction. Writes `obv`. Handles missing `volume` field (treated as 0).
- **VWAP** (Volume-Weighted Average Price) — `.vwap(period?, priceKeys?, volumeKey?, setKey?)`. Rolling Σ(TP×vol)/Σ(vol) over window. Writes `vwap{period}`. Default period=14. Handles missing volume field (treated as 0).

### Fixed

- **`getStochRSI` negative index bug** — when history was too short for any K bars to be computed (`stochLast < 0`), the tail-fill loop started at a negative index, accessing `undefined` entries and throwing `TypeError: Cannot set properties of undefined`. Fixed by clamping the loop start to `Math.max(0, stochLast + 1)`.

---

## [2.0.1] — 2026-05-03

### Performance

- **`getSMA`** — replaced O(n × period) summation loop with an O(n) sliding window. All indicators that internally seed from SMA (`getEMA`, `getWEMA`, `getSignal`, `getCCI`, `getADX`) benefit automatically.
- **`getALMA`** — Gaussian coefficients are now precomputed once per call instead of being recomputed for every bar, eliminating O(period) `Math.exp` calls per bar.
- **`getTR`** — replaced `[a, b, c].sort().pop()` (array allocation + sort per bar) with a single `Math.max(a, b, c)` expression. Also **fixes a pre-existing bug** where lexicographic sort produced wrong values for double-digit price differences (e.g. `sort(['10','2','8'])` → `8` instead of `10`).
- **`getSTS`** / **`getWilliamsR`** — replaced `arr.sort().pop()` pattern for period high/low with a direct linear scan, removing per-bar array allocations and sort overhead.
- **`getRSI`** — gain/loss arrays are now only built at the seed position; all subsequent bars use the rolling value directly. Replaced `gArr.slice(0, 1)[0]` with direct index access.
- **`getCCI`** — `smatp` and `tp` lookups are cached outside the inner mean-deviation loop, reducing repeated dynamic property access.
- **`expandMetric`** — replaced `str.split('').slice(0,-1).join('')` with `str.slice(0,-1)` and `str.split('').splice(-1,1).join('')` with `str[str.length-1]`.
- **`getTrend`** — replaced `.slice().reverse()` + `.map()` (two allocations, implicit return array) with a single reverse-index `for` loop using integer counters.

### Fixed

- **`getTR` lexicographic sort bug** — `arr.sort()` was comparing array values as strings, causing incorrect True Range values when any component was ≥ 10. Now correctly uses `Math.max()`.

---

## [2.0.0] — 2026-05-02

### Breaking Changes

- **New fluent chain API.** All `getXXX()` named exports have been removed from the public API. Use `tala()` instead:

  ```typescript
  // v1 (removed)
  import { getSMA, getRSI } from '@jimzandueta/tala'
  getSMA(history, 14)
  getRSI(history, 14)

  // v2
  import { tala } from '@jimzandueta/tala'
  const result = tala().sma(14).rsi(14).run(history)
  ```

- **Input is no longer mutated.** `.run()` deep-clones each entry before computing — the original array is always preserved.
- **`changeVal` is auto-computed.** Callers no longer need to manually pre-compute `changeVal` before calling `.rsi()` or `.rsiCross()`.
- **Cross signals moved to structured output.** Cross functions no longer return arrays directly. Chain them and pass `{ structured: true }` to `.run()` to receive `{ history, signals }`.

### Added

- `tala()` factory function returning a reusable `TalaChain` instance.
- `TalaChain` with 14 indicator methods: `.sma()`, `.ema()`, `.wema()`, `.alma()`, `.trix()`, `.macd()`, `.rsi()`, `.cci()`, `.adx()`, `.fisher()`, `.sts()`, `.williamsR()`, `.pivotT()`, `.fibRL()`.
- `TalaChain` with 5 signal methods: `.macdCross()`, `.rsiCross()`, `.cciCross()`, `.almaCross()`, `.fisherCross()`.
- `TalaResult` and `RunOptions` types exported from the package.
- `getTrend` utility exported directly (not on the chain).

### Changed

- Source reorganized into category subdirectories: `src/indicators/trend/`, `src/indicators/momentum/`, `src/indicators/primitives/`, `src/indicators/levels/`, `src/signals/`.
- `src/index.ts` simplified to export only `tala`, `getTrend`, and types.

---

## [0.1.6] — 2026-05-02

### Added

- Dual CJS + ESM build via `tsup` (replaces webpack + babel).
- TypeScript declarations (`dist/index.d.ts`, `dist/index.d.mts`).
- Full unit test suite — 140 tests across all 25 indicators.
- `jest.config.ts` and shared test fixtures in `tests/fixtures.ts`.
- `prepublishOnly` script gates publish behind typecheck + tests + build.
- `package.json` `exports` field with proper CJS/ESM/types conditions.
- `.npmignore` to exclude source, tests, and config from published package.
- GitHub Actions CI workflow (typecheck + test + build on every push/PR).

### Changed

- Build tooling migrated from webpack + babel to `tsup`.
- `package.json` updated with correct `main`, `module`, `types`, `exports`, `files`, `keywords`, and `author`.

### Removed

- `webpack.config.js` and `babel.config.json`.
