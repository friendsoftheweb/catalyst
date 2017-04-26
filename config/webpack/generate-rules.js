const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const environment = require('../../utils/environment');
const resolveModulePath = require('../../utils/resolve-module-path');

function generateRules({ context, rootPath }) {
  const env = environment();
  const babelPlugins = [];
  const rules = [];

  rules.push({
    test: /\.scss$/,
    use: ExtractTextPlugin.extract({
      use: [
        {
          loader: resolveModulePath('css-loader'),
          options: {
            root: rootPath
          }
        },
        {
          loader: resolveModulePath('postcss-loader'),
          options: {
            plugins: function() {
              return [require(resolveModulePath('autoprefixer'))];
            }
          }
        },
        resolveModulePath('sass-loader')
      ]
    })
  });

  rules.push({
    test: /\.js$/,
    include: rootPath,
    use: [
      {
        loader: resolveModulePath('babel-loader'),
        options: {
          cacheDirectory: true
        }
      }
    ]
  });

  const assetFilePath = env.development ? '[path][name].[ext]' : '[path][name]-[hash].[ext]';

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

module.exports = generateRules;
