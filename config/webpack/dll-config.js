const path = require('path');
const webpack = require('webpack');
const loadConfig = require('../../utils/load-config');
const projectRoot = process.cwd();

const config = loadConfig();
const projectDependencies = Object.keys(
  require(path.join(projectRoot, 'package.json')).dependencies || {}
);

module.exports = {
  context: projectRoot,
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
      path: path.join(projectRoot, '/tmp/catalyst/[name].json')
    })
  ],

  output: {
    filename: '[name]-dll.js',
    path: path.join(projectRoot, '/tmp/catalyst'),
    library: '[name]'
  }
};
