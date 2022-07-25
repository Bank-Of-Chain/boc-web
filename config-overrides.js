const path = require("path");

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
  return config;
};
