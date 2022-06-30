const path = require("path")
const moment = require("moment")

const FileManagerPlugin = require("filemanager-webpack-plugin")

function resolve (dir) {
  return path.join(__dirname, ".", dir)
}

const { NODE_ENV } = process.env
module.exports = function override (config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    "@": resolve("src"),
    "@components": resolve("src/components"),
    "@constants": resolve("src/constants"),
    "@hooks": resolve("src/hooks"),
  }
  if (NODE_ENV === "production") {
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
  }
  return config
}
