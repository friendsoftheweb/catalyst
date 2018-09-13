const fs = require('fs');
const path = require('path');
const { reduce } = require('lodash');

const { getEnvironment, getConfig, getDirectories } = require('../../utils');
const generateDevtool = require('./generateDevtool');
const generateEntry = require('./generateEntry');
const generateOutput = require('./generateOutput');
const generatePlugins = require('./generatePlugins');
const generateRules = require('./generateRules');
const generateOptimization = require('./generateOptimization');

const defaultOptions = {
  publicPath: '/assets/',
  transformModules: [
    '@ftw/redux-resources',
    '@ftw/redux-utils',
    'axios',
    'luxon',
    'react',
    'react-dom',
    'react-router',
    'react-router-dom',
    'react-transition-group',
    'redux',
    'redux-saga'
  ]
};

function webpackConfig(options = {}) {
  const env = getEnvironment();
  const config = getConfig();
  const directories = getDirectories();

  options = Object.assign(
    {
      context: directories.context,
      projectRoot: directories.project,
      buildPath: directories.build
    },
    defaultOptions,
    options
  );

  const bundlePaths = fs
    .readdirSync(directories.bundles)
    .map(bundlePath => path.join(directories.bundles, bundlePath))
    .filter(bundlePath => fs.statSync(bundlePath).isDirectory());

  return {
    context: directories.context,
    mode: env.production ? 'production' : 'development',
    devtool: generateDevtool(),
    entry: reduce(
      bundlePaths,
      (entry, bundlePath) => {
        const parts = bundlePath.split('/');
        const bundleName = parts[parts.length - 1];
        const relativeBundlePath = `./bundles/${bundleName}/index.js`;

        return Object.assign({}, entry, {
          [bundleName]: generateEntry(relativeBundlePath)
        });
      },
      {}
    ),
    output: generateOutput(options),
    resolve: {
      modules: [config.rootPath, 'node_modules']
    },
    plugins: generatePlugins(options),
    module: {
      rules: generateRules(options)
    },
    optimization: generateOptimization(options)
  };
}

module.exports = webpackConfig;
