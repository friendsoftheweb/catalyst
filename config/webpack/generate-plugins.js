const environment = require('../../utils/environment');
const resolveModulePath = require('../../utils/resolve-module-path');
const webpack = require(resolveModulePath('webpack'));
const MiniCssExtractPlugin = require(resolveModulePath(
  'mini-css-extract-plugin'
));
const ManifestPlugin = require(resolveModulePath('webpack-manifest-plugin'));
const CompressionPlugin = require(resolveModulePath(
  'compression-webpack-plugin'
));

function generatePlugins(options = {}) {
  const env = environment();

  const cssFileName = env.production
    ? '[name]-[contenthash].css'
    : '[name].css';

  const plugins = [
    new MiniCssExtractPlugin({
      filename: cssFileName
    })
  ];

  plugins.push(
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    })
  );

  if (options.commonsChunk) {
    plugins.push(
      new webpack.optimization.splitChunks({
        name: 'commons'
      })
    );
  }

  if (env.production) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
          warnings: false
        }
      }),
      new CompressionPlugin({ test: /\.(js|css)$/ })
    );
  }

  if (env.production || env.test) {
    plugins.push(new ManifestPlugin({ fileName: 'manifest.json' }));
  }

  return plugins;
}

module.exports = generatePlugins;
