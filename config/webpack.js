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
      extensions: ['', '.js'],
      root: rootPath,
      modulesDirectories: ['node_modules']
    },

    plugins: generatePlugins({
      context,
      rootPath,
      buildPath
    }),

    module: {
      loaders: generateLoaders({
        context,
        rootPath,
        buildPath
      })
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

function generateOutput({ context, buildPath }) {
  const output = {};

  if (productionBuild) {
    output.path = buildPath;
    output.filename = '[name]-[hash].js';
  } else if (testBuild) {
    output.path = buildPath;
    output.filename = '[name].js';
  } else {
    output.path = path.join(context, 'app', 'assets');
    output.filename = '[name].js';
    output.publicPath = `http://localhost:${devServerPort}/`;
  }

  return output;
}

function generatePlugins() {
  const cssFileName = developmentBuild ? '[name].css' : '[name]-[hash].css';

  const plugins = [
    new ExtractTextPlugin(path.join(cssFileName), {
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

function generateLoaders({ context, rootPath }) {
  const loaders = [];

  loaders.push({
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract([
      `css?root=${rootPath}`,
      'postcss-loader',
      'sass'
    ])
  });

  loaders.push({
    test: /\.js$/,
    include: rootPath,
    loader: 'babel',
    query: {
      presets: ['react', 'es2015', 'stage-2']
    }
  });

  const assetFilePath = developmentBuild ? '[path][name].[ext]' : '[path][name]-[hash].[ext]';

  loaders.push({
    test: /\.(jpe?g|gif|png|svg|woff|woff2)$/,
    include: path.join(rootPath, 'assets'),
    loader: 'file',
    query: {
      context: path.join(rootPath, 'assets'),
      name: assetFilePath,
      publicPath: '/assets/'
    }
  });

  return loaders;
}

module.exports = webpackConfig;
