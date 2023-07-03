import path from 'path'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import Analyze from 'rollup-plugin-visualizer'
import reactRefresh from '@vitejs/plugin-react-refresh'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import importToCDN from 'vite-plugin-cdn-import'
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
          } else if (id.includes('material-ui') || id.includes('swiper') || id.includes('walletconnect')) {
            return 'vendor2'
          } else if (
            id.includes('paraswap') ||
            id.includes('elliptic') ||
            id.includes('bn.js') ||
            id.includes('lodash') ||
            id.includes('bignumber.js')
          ) {
            return 'vendor3'
          } else if (
            id.includes('piggy-finance-utils') ||
            id.includes('axios-cache-adapter') ||
            id.includes('ethersproject') ||
            id.includes('axios') ||
            id.includes('ethereumjs-abi')
          ) {
            return 'vendor4'
          } else if (id.includes('node_modules')) {
            return 'vendor5'
          }

          return 'vendor'
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
        {
          name: 'react',
          var: 'React',
          path: 'https://cdn.bootcdn.net/ajax/libs/react/17.0.0/umd/react.production.min.js'
        },
        {
          name: 'react-dom',
          var: 'ReactDOM',
          path: 'https://cdn.bootcdn.net/ajax/libs/react-dom/17.0.0/umd/react-dom.production.min.js'
        },
        {
          name: 'web3',
          var: 'Web3',
          path: 'https://cdn.bootcdn.net/ajax/libs/web3/1.9.0/web3.min.js'
        }
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
