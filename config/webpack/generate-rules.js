const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const environment = require('../../utils/environment');

function generateRules({ context, rootPath }) {
  const env = environment();
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
