const path = require('path');
const webpack = require('webpack');
const projectRoot = process.cwd();

module.exports = {
  context: projectRoot,
  mode: 'development',

  resolve: {
    modules: ['node_modules']
  },

  entry: {
    library: [
      'lodash',
      'react',
      'react-dom',
      'redux',
      'redux-saga',
      'react-router',
      'react-router-dom',
      'react-redux',
      'regenerator-runtime'
    ]
  },

  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(projectRoot, '/tmp/catalyst/[name].json')
    })
  ],

  output: {
    filename: '[name].dll.js',
    path: path.join(projectRoot, '/tmp/catalyst'),
    library: '[name]'
  }
};
