const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const environment = require('../../utils/environment');

function generatePlugins() {
  const env = environment();

  const cssFileName = env.development ? '[name].css' : '[name]-[contenthash].css';

  const plugins = [
    new ExtractTextPlugin({
      filename: cssFileName,
      allChunks: true
    })
  ];

  if (env.production || env.test) {
    plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      })
    );
  }

  if (env.production) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    );
  }

  if (env.production || env.test) {
    plugins.push(new ManifestPlugin());
  }

  return plugins;
}

module.exports = generatePlugins;
