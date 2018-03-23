const path = require('path');
const webpack = require('webpack');
const loadConfig = require('../../utils/load-config');
const getDirectories = require('../../utils/getDirectories');

const config = loadConfig();
const directories = getDirectories();
const projectDependencies = Object.keys(
  require(path.join(directories.projectPath, 'package.json')).dependencies || {}
);

module.exports = {
  context: directories.projectPath,
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
      path: path.join(directories.projectPath, '/tmp/catalyst/[name].json')
    })
  ],

  output: {
    filename: '[name]-dll.js',
    path: path.join(directories.projectPath, '/tmp/catalyst'),
    library: '[name]'
  }
};
