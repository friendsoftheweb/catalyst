const path = require('path');
const environment = require('../../utils/environment');
const resolveModulePath = require('../../utils/resolve-module-path');
const ExtractTextPlugin = require(resolveModulePath('extract-text-webpack-plugin'));
const babelConfig = require('../../config/babel');

function generateRules({ context, rootPath }) {
  const env = environment();
  const rules = [];

  const scssRules = [
    {
      loader: resolveModulePath('css-loader'),
      options: {
        root: rootPath,
        sourceMap: true
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
    {
      loader: resolveModulePath('sass-loader'),
      options: {
        sourceMap: true
      }
    }
  ];

  if (env.development) {
    rules.push({
      test: /\.scss$/,
      use: [resolveModulePath('style-loader'), ...scssRules]
    });
  } else {
    rules.push({
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({
        use: scssRules
      })
    });
  }

  rules.push({
    test: /\.js$/,
    include: rootPath,
    use: [
      {
        loader: resolveModulePath('babel-loader'),
        options: Object.assign(
          {
            cacheDirectory: true
          },
          babelConfig(false)
        )
      },
      {
        loader: path.resolve(__dirname, './loaders/component-styles-loader.js')
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
          context: path.join(rootPath, 'assets'),
          name: assetFilePath,
          publicPath: `http://${env.devServerHost}:${env.devServerPort}/`
        }
      }
    ]
  });

  return rules;
}

module.exports = generateRules;
