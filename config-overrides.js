const path = require("path");
const moment = require("moment");

const FileManagerPlugin = require("filemanager-webpack-plugin");
const HtmlWebpackExternalsPlugin = require("html-webpack-externals-plugin");

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
  // config.optimization.splitChunks.maxSize = 512000;
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
    config.plugins.push(
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: "react",
            entry:
              "https://unpkg.com/react@16.14.0/umd/react.production.min.js",
            global: "React",
          },
          {
            module: "react-dom",
            entry:
              "https://unpkg.com/react-dom@16.14.0/umd/react-dom.production.min.js",
            global: "ReactDOM",
          },
          {
            module: "swiper",
            entry: "https://unpkg.com/swiper@8.3.0/swiper-bundle.min.js",
            global: "Swiper",
          },
          {
            module: "ethers",
            entry: "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js",
            global: "Ethers",
          },
        ],
      })
    );
  }
  return config;
};
