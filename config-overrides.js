const path = require("path");
const moment = require("moment");
const webpack = require("webpack");

const FileManagerPlugin = require("filemanager-webpack-plugin");

function resolve(dir) {
  return path.join(__dirname, ".", dir);
}

const { NODE_ENV } = process.env;
module.exports = function override(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    "@": resolve("src"),
    "@components": resolve("src/components"),
    "@constants": resolve("src/constants"),
    "@hooks": resolve("src/hooks"),
  };
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    assert: require.resolve("assert"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify"),
    url: require.resolve("url"),
  });
  config.resolve.fallback = fallback;
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    })
  );
  if (NODE_ENV === "production") {
    config.plugins.push(
      new FileManagerPlugin({
        events: {
          onEnd: {
            archive: [
              {
                source: "./build",
                destination:
                  "./zip/web-" +
                  moment().format("yyyyMMDDHHmmss") +
                  "(" +
                  process.env.REACT_APP_ENV +
                  ").zip",
              },
            ],
          },
        },
      })
    );
  }
  return config;
};
