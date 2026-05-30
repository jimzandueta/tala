/** chart() options */
export interface ChartOptions {
  format?: 'html' | 'server'
  filePath?: string
  port?: number
  title?: string
}

/** chart() result */
export interface ChartResult {
  url?: string
  filePath?: string
}

/** Main-chart overlay keys */
export type OverlayIndicatorKeys = string

/** Separate-pane oscillator keys */
export type OscillatorIndicatorKeys = string

