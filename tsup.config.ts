import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  target: 'es2017',
  splitting: false,
  sourcemap: false,
  outDir: 'dist',
})
