const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

const loadConfig = require('../utils/load-config');

const testBuild = process.env.NODE_ENV === 'test';
const productionBuild = process.env.NODE_ENV === 'production';
const developmentBuild = !(productionBuild || testBuild);

const devServerPort = process.env.WEBPACK_PORT || 8080;

function webpackConfig() {
  const context = process.cwd();
  const config = loadConfig();

  return {
    context,
    devtool: 'source-map',

    entry: {
      application: generateEntry(`./${config.rootPath}/bundles/application.js`)
    },

    output: generateOutput(context, config.buildPath),

    resolve: {
      extensions: ['', '.js'],
      root: path.join(context, config.rootPath),
      modulesDirectories: ['node_modules']
    },

    plugins: generatePlugins(context, config.buildPath),

    module: {
      loaders: [
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract([
            `css?root=${path.join(context, config.rootPath)}`,
            'postcss-loader',
            'sass'
          ])
        },
        {
          test: /\.js$/,
          include: path.join(context, config.rootPath),
          loader: 'babel',
          query: {
            presets: ['react', 'es2015', 'stage-2']
          }
        },
        {
          test: /\.(jpe?g|gif|png|svg|woff|woff2)$/,
          include: path.join(context, config.rootPath, 'assets'),
          loader: 'file',
          query: {
            context: path.join(context, config.rootPath, 'assets'),
            name: '[path][name]-[hash].[ext]',
            publicPath: '/assets/'
          }
        }
      ]
    },

    postcss() {
      return [autoprefixer];
    }
  };
}

function generateEntry(path) {
  const entry = [];

  if (developmentBuild) {
    entry.push(`webpack-dev-server/client?http://localhost:${devServerPort}`);
  }

  entry.push(path);

  return entry;
}

function generateOutput(context, buildPath) {
  const output = {};

  if (productionBuild) {
    output.path = path.join(context, buildPath);
    output.filename = '[name]-[hash].js';
  } else if (testBuild) {
    output.path = path.join(context, buildPath);
    output.filename = '[name].js';
  } else {
    output.path = path.join(context, 'app', 'assets');
    output.filename = 'javascripts/[name].js';
    output.publicPath = `http://localhost:${devServerPort}/`;
  }

  return output;
}

function generatePlugins() {
  const plugins = [
    new ExtractTextPlugin(path.join('[name]-[hash].css'), {
      allChunks: true
    })
  ];

  if (productionBuild || testBuild) {
    plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      })
    );
  }

  if (productionBuild) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    );
  }

  if (productionBuild || testBuild) {
    plugins.push(
      new ManifestPlugin()
    );
  }

  return plugins;
}

module.exports = webpackConfig;
