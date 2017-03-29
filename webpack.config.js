var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'build.js'
  },
  module: {
    // special compilation rules
    loaders: [
      {
        test: /\.vue$/,
        // need to include -loader for the latest version or else 
        // webpack thinks it needs to use vue instead of vue-loader...
        loader: 'vue-loader'
      }
    ]
  }
}