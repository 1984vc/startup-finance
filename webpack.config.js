const GasPlugin = require("gas-webpack-plugin");
const webpack = require("webpack");

const entry = "./gas-build/index.js";
const { version } = require("./package.json");

console.log(`Building version ${version}`);

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
      comment: true,
    }),
    new webpack.DefinePlugin({
      "process.env.VERSION": JSON.stringify(version),
    }),
  ],
  devtool: false,
};
