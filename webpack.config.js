const { resolve } = require("path");

const config = {
  mode: "development",
  entry: "./src/demo.jsx",
  output: {
    path: resolve(__dirname, "./test/"),
    filename: "index.js",
    sourceMapFilename: "index.js.map",
  },
  //cache: true,
  //devtool: 'source-map',
  devtool: "cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.scss$/,
        loader: "style!css!sass",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx.", ".js", ".jsx"],
    modules: ["./node_modules"],
  },
  resolveLoader: { modules: ["./node_modules"] },
};

module.exports = config;
