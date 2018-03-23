const fs = require('fs');
const path = require('path');
const { reduce } = require('lodash');

const environment = require('../../utils/environment');
const loadConfig = require('../../utils/load-config');
const getDirectories = require('../../utils/getDirectories');
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
  const env = environment();
  const config = loadConfig();
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
    mode: env.development ? 'development' : 'production',
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
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'common',
            chunks: 'all'
          }
        }
      }
    }
  };
}

module.exports = webpackConfig;
