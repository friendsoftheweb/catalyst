const fs = require('fs');
const path = require('path');
const { reduce } = require('lodash');

const loadConfig = require('../../utils/load-config');
const generateDevtool = require('./generate-devtool');
const generateEntry = require('./generate-entry');
const generateOutput = require('./generate-output');
const generatePlugins = require('./generate-plugins');
const generateRules = require('./generate-rules');

function webpackConfig() {
  const context = process.cwd();
  const config = loadConfig();
  const rootPath = path.join(context, config.rootPath);
  const buildPath = path.join(context, config.buildPath);
  const bundlesPath = path.join(context, `${config.rootPath}/bundles`);

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

        return Object.assign({}, entry, { [bundleName]: generateEntry(bundlePath) });
      },
      {}
    ),
    output: generateOutput({
      context,
      rootPath,
      buildPath
    }),
    resolve: {
      extensions: ['.js'],
      modules: [rootPath, 'node_modules']
    },
    plugins: generatePlugins({
      context,
      rootPath,
      buildPath
    }),
    module: {
      loaders: generateRules({
        context,
        rootPath,
        buildPath
      })
    }
  };
}

module.exports = webpackConfig;
