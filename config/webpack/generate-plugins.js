const environment = require('../../utils/environment');
const resolveModulePath = require('../../utils/resolve-module-path');
const webpack = require(resolveModulePath('webpack'));
const ExtractTextPlugin = require(resolveModulePath(
  'extract-text-webpack-plugin'
));
const ManifestPlugin = require(resolveModulePath('webpack-manifest-plugin'));
const CompressionPlugin = require(resolveModulePath(
  'compression-webpack-plugin'
));

function generatePlugins() {
  const env = environment();

  const cssFileName = env.production
    ? '[name]-[contenthash].css'
    : '[name].css';

  const plugins = [
    new ExtractTextPlugin({
      filename: cssFileName,
      allChunks: true
    })
  ];

  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
      }
    })
  );

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

  if (env.development) {
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  return plugins;
}

module.exports = generatePlugins;
