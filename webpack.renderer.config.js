const rules = require("./webpack.rules");
const path = require("path");

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

rules.push({
  test: /\.(png|jpe?g|gif)$/i,
  type: "asset/resource",
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  devServer: {
    host: 'localhost',  // Set the host to 'localhost'
    port: 3000,  // Set the port to 3000
    hot: true,  // Enable hot module replacement
    liveReload: true,  // Enable live reloading
  },
};
