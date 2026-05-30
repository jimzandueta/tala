import { runServer } from '../../src/viz/ServerRunner'

describe('ServerRunner', () => {
  describe('runServer()', () => {
    it('returns an http.Server with listen and close', async () => {
      const server = runServer(7894, '<html><body>test</body></html>', false)
      expect(server).toHaveProperty('close')
      expect(typeof server.close).toBe('function')
      server.close()
    })

    it('serves HTML content on the given port', async () => {
      const html = '<!DOCTYPE html><html><body>Hello tala</body></html>'
      const server = runServer(7895, html, false)
      await new Promise<void>(resolve => setTimeout(resolve, 100))

      const httpMod = await import('http')
      const response = await new Promise<string>((resolve, reject) => {
        httpMod.get('http://localhost:7895', res => {
          let data = ''
          res.on('data', chunk => { data += chunk })
          res.on('end', () => resolve(data))
          res.on('error', reject)
        })
      })

      expect(response).toContain('Hello tala')
      server.close()
    })

    it('throws on invalid port', () => {
      expect(() => runServer(-1, 'test', false)).toThrow()
      expect(() => runServer(0, 'test', false)).toThrow()
    })
  })
})