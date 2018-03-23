const path = require('path');
const webpack = require('webpack');
const { getConfig, getDirectories } = require('../../utils');

const config = getConfig();
const directories = getDirectories();
const projectDependencies = Object.keys(
  require(path.join(directories.project, 'package.json')).dependencies || {}
);

module.exports = {
  context: directories.project,
  mode: 'development',

  resolve: {
    modules: ['node_modules']
  },

  entry: {
    vendor: config.prebuildPackages.filter(
      package => projectDependencies.indexOf(package) > -1
    )
  },

  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(directories.project, '/tmp/catalyst/[name].json')
    })
  ],

  output: {
    filename: '[name]-dll.js',
    path: path.join(directories.project, '/tmp/catalyst'),
    library: '[name]'
  }
};
