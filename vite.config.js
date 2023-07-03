import path from 'path'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import Analyze from 'rollup-plugin-visualizer'
import reactRefresh from '@vitejs/plugin-react-refresh'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import importToCDN, { autoComplete } from 'vite-plugin-cdn-import'
import { splitVendorChunkPlugin } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': {}
  },
  server: {
    port: 3001,
    host: '0.0.0.0'
  },
  preview: {
    port: 3001,
    host: '0.0.0.0'
  },
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: 'build',
    rollupOptions: {
      plugins: [nodePolyfills()],
      output: {
        manualChunks: id => {
          if (id.includes('web3modal')) {
            return 'vendor1'
          } else if (id.includes('walletconnect')) {
            return 'vendor2'
          } else if (id.includes('ethersproject')) {
            return 'vendor2'
          } else if (id.includes('react-is')) {
            return 'vendor2'
          }
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    UnoCSS(),
    reactRefresh(),
    eslint(),
    importToCDN({
      modules: [
        autoComplete('react'),
        autoComplete('react-dom'),
        {
          name: 'web3',
          var: 'web3',
          path: 'https://cdn.bootcdn.net/ajax/libs/web3/1.9.0/web3.min.js'
        },
        {
          name: 'ethers',
          var: 'ethers',
          path: 'https://cdn.bootcdn.net/ajax/libs/ethers/5.4.4/ethers.umd.min.js'
        },
        {
          name: 'lodash-es',
          var: '_',
          path: 'https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.min.js'
        },
        autoComplete('axios')
      ]
    }),
    splitVendorChunkPlugin(),
    Analyze()
  ],
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  }
})
