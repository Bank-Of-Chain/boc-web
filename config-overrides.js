const path = require("path")
const moment = require("moment")

const FileManagerPlugin = require("filemanager-webpack-plugin")

function resolve (dir) {
  return path.join(__dirname, ".", dir)
}

module.exports = function override (config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    "@": resolve("src"),
    "@components": resolve("src/components"),
    "@constants": resolve("src/constants"),
    "@hooks": resolve("src/hooks"),
  }
  config.plugins.push(
    new FileManagerPlugin({
      events: {
        onEnd: {
          archive: [
            {
              source: "./build",
              destination:
                "./zip/web-" + moment().format("yyyyMMDDHHmmss") + "(" + process.env.REACT_APP_ENV + ").zip",
            },
          ],
        },
      },
    }),
  )
  return config
}
