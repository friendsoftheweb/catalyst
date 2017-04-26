const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

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

function generateEntry(entryPath) {
  const entry = [];

  if (developmentBuild) {
    entry.push(`webpack-dev-server/client?http://localhost:${devServerPort}`);
  }

  entry.push('es5-shim', 'es6-promise/auto', path.resolve(__dirname, '../vendor/react-ujs'));

  entry.push(entryPath);

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
  const cssFileName = developmentBuild ? '[name].css' : '[name]-[contenthash].css';

  const plugins = [
    new ExtractTextPlugin({
      filename: cssFileName,
      allChunks: true
    })
  ];

  if (productionBuild || testBuild) {
    plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
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
    plugins.push(new ManifestPlugin());
  }

  return plugins;
}

function generateRules({ context, rootPath }) {
  const babelPlugins = [];
  const rules = [];

  rules.push({
    test: /\.scss$/,
    use: ExtractTextPlugin.extract({
      use: [
        {
          loader: 'css-loader',
          options: {
            root: rootPath
          }
        },
        {
          loader: 'postcss-loader',
          options: {
            plugins: function() {
              return [require('autoprefixer')];
            }
          }
        },
        'sass-loader'
      ]
    })
  });

  rules.push({
    test: /\.js$/,
    include: rootPath,
    use: [
      {
        loader: 'babel-loader',
        options: {
          plugins: babelPlugins,
          presets: [
            [
              'env',
              {
                modules: false,
                targets: {
                  browsers: ['last 2 versions', 'not IE <= 10']
                }
              }
            ],
            'react',
            'stage-2'
          ]
        }
      }
    ]
  });

  const assetFilePath = developmentBuild ? '[path][name].[ext]' : '[path][name]-[hash].[ext]';

  rules.push({
    test: /\.(jpe?g|gif|png|svg|woff|woff2)$/,
    include: path.join(rootPath, 'assets'),
    use: [
      {
        loader: 'file-loader',
        options: {
          query: {
            context: path.join(rootPath, 'assets'),
            name: assetFilePath,
            publicPath: '/assets/'
          }
        }
      }
    ]
  });

  return rules;
}

module.exports = webpackConfig;
