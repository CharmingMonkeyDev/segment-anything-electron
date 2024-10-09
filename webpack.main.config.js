const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/index.js",
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules"),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        // { from: 'bin', to: '../bin' },
        { from: 'models', to: '../renderer/main_window/models' },
      ]
    })
  ],
  externals: {
    'onnxruntime': 'onnxruntime-node',
  }
};
