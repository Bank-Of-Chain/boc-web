import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setup.js'],
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
