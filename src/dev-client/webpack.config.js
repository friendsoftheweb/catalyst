const path = require('path');

const context = __dirname;

module.exports = {
  mode: 'production',
  context,
  entry: {
    'dev-client': './index.js'
  },
  output: {
    path: path.resolve(__dirname, '../../lib'),
    filename: 'dev-client.js'
  },
  resolve: {
    extensions: ['.js', '.json', '.ejs']
  },
  module: {
    rules: [
      { test: /\.ejs$/, loader: 'ejs-compiled-loader' },
      {
        test: /\.js$/,
        include: context,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: false
  }
};
