import type { ChartResult } from '../viz/types'
import type { ServerInstance } from '../viz/ServerRunner'

export class ChartTerminal {
  readonly url?: string
  readonly filePath?: string
  private serverInstance?: ServerInstance

  constructor(result: ChartResult & { serverInstance?: ServerInstance }) {
    this.url = result.url
    this.filePath = result.filePath
    this.serverInstance = result.serverInstance
  }

  close(): void {
    this.serverInstance?.close()
    this.serverInstance = undefined
  }
}
