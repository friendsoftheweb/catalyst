const path = require('path');

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: {
    index: ['regenerator-runtime/runtime', './src/index.ts'],
    frame: './src/frame.ts',
  },
  node: {
    fs: 'empty',
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'src')],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
  },
};
