const path = require('path')

const { env } = require('./configs/address.json')

// === Utils === //
const moment = require('moment')

// === Plugins === //
const FileManagerPlugin = require('filemanager-webpack-plugin')

const resolve = dir => path.join(__dirname, '.', dir)

const { NODE_ENV } = process.env
module.exports = function override(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': resolve('src')
  }
  if (NODE_ENV === 'production') {
    config.plugins.push(
      new FileManagerPlugin({
        events: {
          onEnd: {
            archive: [
              {
                source: './build',
                destination: './zip/web-' + moment().format('yyyyMMDDHHmmss') + '(' + env + ').zip'
              }
            ]
          }
        }
      })
    )
  }
  return config
}
