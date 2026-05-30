import * as http from 'http'
import { execFile } from 'child_process'

export interface ServerInstance {
  server: http.Server
  port: number
  close(): void
}

export function runServer(port: number, htmlContent: string, openBrowser = true, recalcHandler?: (data: unknown) => unknown): ServerInstance {
  if (port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${port}`)
  }

  const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    // POST /recalc
    if (req.method === 'POST' && req.url === '/recalc' && recalcHandler) {
      const MAX_BODY = 10 * 1024 * 1024 // 10 MB
      let body = ''
      let tooLarge = false
      req.on('data', (chunk: string) => {
        if (tooLarge) return
        body += chunk
        if (body.length > MAX_BODY) {
          tooLarge = true
          res.writeHead(413, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Payload Too Large' }))
        }
      })
      req.on('end', () => {
        if (tooLarge) return
        try {
          const input = JSON.parse(body)
          // Basic OHLC validation
          if (!Array.isArray(input.chartData)) throw new Error('chartData must be an array')
          for (const entry of input.chartData) {
            if (typeof entry.open !== 'number' || typeof entry.high !== 'number' || typeof entry.low !== 'number' || typeof entry.close !== 'number') {
              throw new Error('Each entry must have numeric open, high, low, close')
            }
          }
          const result = recalcHandler(input)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(result))
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: (e as Error).message }))
        }
      })
      return
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'self'",
    })
    res.end(htmlContent)
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      throw new Error(`Port ${port} is already in use`)
    }
    throw err
  })

  server.listen(port, () => {
    const url = `http://localhost:${port}`
    if (openBrowser) {
      execFile('open', [url], () => { /* ignore */ })
    }
  })

  return {
    server,
    port,
    close() {
      server.close()
    },
  }
}

export async function findAvailablePort(startPort: number, maxRetries = 3): Promise<number> {
  const net = await import('net')
  for (let i = 0; i < maxRetries; i++) {
    const port = startPort + i
    const available = await new Promise<boolean>(resolve => {
      const sock = new net.Socket()
      sock.once('error', () => {
        resolve(true)
        sock.destroy()
      })
      sock.once('connect', () => {
        resolve(false)
        sock.destroy()
      })
      sock.connect(port, '127.0.0.1')
    })
    if (available) return port
  }
  throw new Error(`Could not find available port starting from ${startPort}`)
}
