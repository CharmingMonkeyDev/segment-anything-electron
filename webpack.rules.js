const path = require('path');

module.exports = [
  {
    test: /\.(glb|gltf)$/,
    type: "asset/resource",
  },
  // Add support for native node modules
  // {
  //   // We're specifying native_modules in the test because the asset relocator loader generates a
  //   // "fake" .node file which is really a cjs file.
  //   test: /native_modules[/\\].+\.node$/,
  //   use: "node-loader",
  // },
  // {
  //   test: /[/\\]node_modules[/\\].+\.(m?js)$/,
  //   parser: { amd: false },
  //   use: {
  //     loader: "@vercel/webpack-asset-relocator-loader",
  //     options: {
  //       outputAssetBase: "native_modules",
  //     },
  //   },
  // },
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules\/.+\.node$/,
    use: "node-loader",
  },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: "@vercel/webpack-asset-relocator-loader",
      options: {
        outputAssetBase: "native_modules",
      },
    },
  },
  // {
  //   // We're specifying native_modules in the test because the asset relocator loader generates a
  //   // "fake" .node file which is really a cjs file.
  //   test: /\.node$/,
  //   use: "node-loader",
  //   // include: path.resolve(__dirname, './bin') // Ensure the bin folder is included
  // },
  // {
  //   // We're specifying native_modules in the test because the asset relocator loader generates a
  //   // "fake" .node file which is really a cjs file.
  //   test: /[/\\].+\.node$/,
  //   use: "node-loader",
  // },
  // Put your webpack loader rules in this array.  This is where you would put
  // your ts-loader configuration for instance:
  /**
   * Typescript Example:
   *
   * {
   *   test: /\.tsx?$/,
   *   exclude: /(node_modules|.webpack)/,
   *   loaders: [{
   *     loader: 'ts-loader',
   *     options: {
   *       transpileOnly: true
   *     }
   *   }]
   * }
   */
];
