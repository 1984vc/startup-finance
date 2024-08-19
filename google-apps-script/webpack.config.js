const GasPlugin = require("gas-webpack-plugin");
const webpack = require("webpack");

const entry = "./build/index.js";
const { version } = require("./package.json");

module.exports = {
  // we always use dev mode because bundle size is unimportant - code runs server-side
  mode: "development",
  context: __dirname,
  entry,
  output: {
    path: __dirname,
    filename: "Code.js",
  },
  plugins: [
    new GasPlugin({
      autoGlobalExportsFiles: [entry],
    }),
    new webpack.DefinePlugin({
      "process.env.VERSION": JSON.stringify(version),
    }),
  ],
  devtool: false,
};
