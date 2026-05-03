# Changelog

All notable changes to `@jimzandueta/tala` are documented here.

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
