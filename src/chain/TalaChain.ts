import { PriceHistoryEntry, MACDPeriods, MACDOptions, PriceKeys, STSSetKey, FisherSetKeys, TalaResult, RunOptions } from '../types'
import type { ChartOptions } from '../viz/types'
import type { ChartTerminal } from './ChartTerminal'
import { getSMA } from '../indicators/trend/sma'
import { getEMA } from '../indicators/trend/ema'
import { getALMA } from '../indicators/trend/alma'
import { getWEMA } from '../indicators/trend/wema'
import { getTRIX } from '../indicators/trend/trix'
import { getMACD } from '../indicators/trend/macd'
import { getRSI } from '../indicators/momentum/rsi'
import { getCCI } from '../indicators/momentum/cci'
import { getWilliamsR } from '../indicators/momentum/williamsR'
import { getSTS } from '../indicators/momentum/sts'
import { getFisher } from '../indicators/momentum/fisher'
import { getADX } from '../indicators/momentum/adx'
import { getPivotT } from '../indicators/levels/pivotT'
import { getFibRL } from '../indicators/levels/fibRL'
import { getBB } from '../indicators/trend/bb'
import { getATR } from '../indicators/primitives/atr'
import { getStochRSI } from '../indicators/momentum/stochRSI'
import { getOBV } from '../indicators/volume/obv'
import { getVWAP } from '../indicators/volume/vwap'
import { getALMACross } from '../signals/almaCross'
import { getMACDCross } from '../signals/macdCross'
import { getRSICross } from '../signals/rsiCross'
import { getCCICross } from '../signals/cciCross'
import { getFisherCross } from '../signals/fisherCross'

type IndicatorOp = (hist: PriceHistoryEntry[]) => void
type SignalOp = (hist: PriceHistoryEntry[]) => { key: string; events: PriceHistoryEntry[] }

export class TalaChain {
  private indicatorOps: IndicatorOp[] = []
  private signalOps: SignalOp[] = []

  sma(period: number, priceKey?: string, setKey?: string): this {
    this.indicatorOps.push(h => getSMA(h, period, priceKey, setKey))
    return this
  }

  ema(period: number, offset?: number | null, priceKey?: string, setKey?: string): this {
    this.indicatorOps.push(h => getEMA(h, period, offset, priceKey, setKey))
    return this
  }

  alma(period?: number, sigma?: number, offset?: number, keyPrice?: string): this {
    this.indicatorOps.push(h => getALMA(h, period, sigma, offset, keyPrice))
    return this
  }

  wema(period: number, offset: number, priceKey?: string, setKey?: string): this {
    this.indicatorOps.push(h => getWEMA(h, period, offset, priceKey, setKey))
    return this
  }

  trix(period?: number, priceKey?: string, setKey?: string): this {
    this.indicatorOps.push(h => getTRIX(h, period, priceKey, setKey))
    return this
  }

  macd(periods?: MACDPeriods, options?: MACDOptions, priceKey?: string, setKey?: string): this {
    this.indicatorOps.push(h => getMACD(h, periods ?? {}, options ?? {}, priceKey, setKey))
    return this
  }

  rsi(period?: number, changeKey?: string, setKey?: string): this {
    this.indicatorOps.push(h => {
      h.forEach((entry, i) => {
        if (entry.changeVal === undefined)
          entry.changeVal = i < h.length - 1 ? entry.close - h[i + 1].close : 0
      })
      getRSI(h, period, changeKey, setKey)
    })
    return this
  }

  cci(period?: number, constant?: number, priceKeys?: PriceKeys, setKey?: string): this {
    this.indicatorOps.push(h => getCCI(h, period, constant, priceKeys, setKey))
    return this
  }

  williamsR(period?: number, priceKeys?: PriceKeys, setKey?: string): this {
    this.indicatorOps.push(h => getWilliamsR(h, period, priceKeys, setKey))
    return this
  }

  sts(period?: number, priceKeys?: PriceKeys, setKey?: STSSetKey): this {
    this.indicatorOps.push(h => getSTS(h, period, priceKeys, setKey))
    return this
  }

  fisher(period?: number, priceKeys?: PriceKeys, setKeys?: FisherSetKeys): this {
    this.indicatorOps.push(h => getFisher(h, period, priceKeys, setKeys))
    return this
  }

  adx(period?: number, priceKeys?: PriceKeys, setKey?: string): this {
    this.indicatorOps.push(h => getADX(h, period, priceKeys, setKey))
    return this
  }

  pivotT(period?: number, priceKeys?: PriceKeys): this {
    this.indicatorOps.push(h => getPivotT(h, period, priceKeys))
    return this
  }

  fibRL(period?: number, priceKeys?: PriceKeys): this {
    this.indicatorOps.push(h => getFibRL(h, period, priceKeys))
    return this
  }

  bb(period?: number, k?: number, priceKey?: string): this {
    this.indicatorOps.push(h => getBB(h, period, k, priceKey))
    return this
  }

  atr(period?: number, priceKeys?: PriceKeys): this {
    this.indicatorOps.push(h => getATR(h, period, priceKeys))
    return this
  }

  stochRSI(period?: number, changeKey?: string, kSetKey?: string, dSetKey?: string): this {
    this.indicatorOps.push(h => {
      h.forEach((entry, i) => {
        if (entry.changeVal === undefined)
          entry.changeVal = i < h.length - 1 ? entry.close - h[i + 1].close : 0
      })
      getStochRSI(h, period, changeKey, kSetKey, dSetKey)
    })
    return this
  }

  obv(priceKey?: string, volumeKey?: string, setKey?: string): this {
    this.indicatorOps.push(h => getOBV(h, priceKey, volumeKey, setKey))
    return this
  }

  vwap(period?: number, priceKeys?: PriceKeys, volumeKey?: string, setKey?: string): this {
    this.indicatorOps.push(h => getVWAP(h, period, priceKeys, volumeKey, setKey))
    return this
  }

  almaCross(period?: number, sigma?: number, offset?: number, keyPrice?: string): this {
    this.signalOps.push(h => ({ key: 'almaCross', events: getALMACross(h, period, sigma, offset, keyPrice) }))
    return this
  }

  macdCross(periods?: MACDPeriods, priceKey?: string): this {
    this.signalOps.push(h => ({ key: 'macdCross', events: getMACDCross(h, periods, priceKey) }))
    return this
  }

  rsiCross(limits?: number[], period?: number): this {
    this.signalOps.push(h => {
      h.forEach((entry, i) => {
        if (entry.changeVal === undefined)
          entry.changeVal = i < h.length - 1 ? entry.close - h[i + 1].close : 0
      })
      return { key: 'rsiCross', events: getRSICross(h, limits, period) }
    })
    return this
  }

  cciCross(limit?: number, period?: number, constant?: number, priceKeys?: PriceKeys): this {
    this.signalOps.push(h => ({ key: 'cciCross', events: getCCICross(h, limit, period, constant, priceKeys) }))
    return this
  }

  fisherCross(period?: number, priceKeys?: PriceKeys): this {
    this.signalOps.push(h => ({ key: 'fisherCross', events: getFisherCross(h, period, priceKeys) }))
    return this
  }

  run(history: PriceHistoryEntry[]): PriceHistoryEntry[]
  run(history: PriceHistoryEntry[], opts: { structured: true }): TalaResult
  run(history: PriceHistoryEntry[], opts?: RunOptions): PriceHistoryEntry[] | TalaResult {
    const data = history.map(e => ({ ...e }))
    this.indicatorOps.forEach(op => op(data))

    if (opts?.structured) {
      const signals: Record<string, PriceHistoryEntry[]> = {}
      this.signalOps.forEach(op => {
        const { key, events } = op(data)
        signals[key] = events
      })
      return { history: data, signals }
    }

    return data
  }

  async chart(history: PriceHistoryEntry[], options?: ChartOptions): Promise<ChartTerminal> {
    const { LightweightChartAdapter } = await import('../viz/LightweightChartAdapter')
    const { HtmlRenderer } = await import('../viz/HtmlRenderer')
    const { runServer, findAvailablePort } = await import('../viz/ServerRunner')
    const { ChartTerminal } = await import('./ChartTerminal')

    const enrichedHistory = this.run(history)

    const adapter = new LightweightChartAdapter(enrichedHistory)
    const renderer = new HtmlRenderer(adapter, options ?? {})

    const format = options?.format ?? 'server'

    if (format === 'html') {
      let filePath = options?.filePath ?? './demo/tala-chart.html'
      const path = await import('path')
      const resolvedPath = path.resolve(filePath)
      const cwd = path.resolve('.')
      if (!resolvedPath.startsWith(cwd + path.sep) && resolvedPath !== cwd) {
        throw new Error('filePath must be within the current working directory')
      }
      if (!resolvedPath.endsWith('.html')) {
        throw new Error('filePath must end with .html')
      }
      const fs = await import('fs')
      fs.writeFileSync(resolvedPath, renderer.render(), 'utf-8')
      return new ChartTerminal({ filePath: resolvedPath })
    }

    // server mode
    let port = options?.port ?? 7890
    try {
      port = await findAvailablePort(port)
    } catch {
      throw new Error(`Could not find available port starting from ${port}`)
    }

    const html = renderer.render()
    // reuse configured indicator ops for recalc
    const ops = this.indicatorOps.slice()
    const serverInstance = runServer(port, html, true, (input: unknown) => {
      const data = (input as { chartData: PriceHistoryEntry[] }).chartData
      if (!data || !Array.isArray(data)) throw new Error('Invalid chartData')
      ops.forEach(op => op(data))
      return { chartData: data }
    })
    return new ChartTerminal({ url: `http://localhost:${port}`, serverInstance })
  }
}
