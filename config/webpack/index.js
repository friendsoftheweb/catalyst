const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const loadConfig = require('../../utils/load-config');
const generateEntry = require('./generate-entry');
const generateOutput = require('./generate-output');
const generatePlugins = require('./generate-plugins');
const generateRules = require('./generate-rules');

function webpackConfig() {
  const context = process.cwd();
  const config = loadConfig();
  const rootPath = path.join(context, config.rootPath);
  const buildPath = path.join(context, config.buildPath);

  return {
    context,
    devtool: 'source-map',

    entry: {
      application: generateEntry(`./${config.rootPath}/bundles/application.js`)
    },

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
