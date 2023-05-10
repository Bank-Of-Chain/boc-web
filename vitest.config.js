import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    deps: {
      inline: ['echarts']
    },
    environment: 'jsdom',
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
