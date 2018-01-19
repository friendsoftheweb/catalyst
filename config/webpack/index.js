const fs = require('fs');
const path = require('path');
const { reduce } = require('lodash');

const loadConfig = require('../../utils/load-config');
const generateDevtool = require('./generate-devtool');
const generateEntry = require('./generate-entry');
const generateOutput = require('./generate-output');
const generatePlugins = require('./generate-plugins');
const generateRules = require('./generate-rules');

const defaultOptions = {
  commonsChunk: false,
  publicPath: '/assets/'
};

function webpackConfig(options = {}) {
  const context = process.cwd();
  const config = loadConfig();
  const rootPath = path.join(context, config.rootPath);
  const buildPath = path.join(context, config.buildPath);
  const bundlesPath = path.join(context, `${config.rootPath}/bundles`);

  options = Object.assign(
    {
      context,
      rootPath,
      buildPath
    },
    defaultOptions,
    options
  );

  const bundlePaths = fs
    .readdirSync(bundlesPath)
    .map(bundlePath => path.join(bundlesPath, bundlePath))
    .filter(bundlePath => fs.statSync(bundlePath).isDirectory())
    .map(bundlePath => path.join(bundlePath, 'index.js'));

  return {
    context,
    devtool: generateDevtool(),
    entry: reduce(
      bundlePaths,
      (entry, bundlePath) => {
        const parts = bundlePath.split('/');
        const bundleName = parts[parts.length - 2];

        return Object.assign({}, entry, {
          [bundleName]: generateEntry(bundlePath)
        });
      },
      {}
    ),
    output: generateOutput(options),
    resolve: {
      extensions: ['.js'],
      modules: [rootPath, 'node_modules']
    },
    plugins: generatePlugins(options),
    module: {
      loaders: generateRules(options)
    }
  };
}

module.exports = webpackConfig;
