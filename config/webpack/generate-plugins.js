const environment = require('../../utils/environment');
const resolveModulePath = require('../../utils/resolve-module-path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require(resolveModulePath(
  'mini-css-extract-plugin'
));
const ManifestPlugin = require(resolveModulePath('webpack-manifest-plugin'));

function generatePlugins(options = {}) {
  const env = environment();

  const cssFileName = env.production ? '[name]-[hash].css' : '[name].css';

  const plugins = [];

  if (env.development) {
    plugins.push(
      new webpack.DllReferencePlugin({
        context: options.projectRoot,
        manifest: require(`${options.projectRoot}/tmp/catalyst/library.json`)
      })
    );
  }

  plugins.push(
    new MiniCssExtractPlugin({
      filename: cssFileName
    })
  );

  plugins.push(
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    })
  );

  if (env.production || env.test) {
    plugins.push(new ManifestPlugin({ fileName: 'manifest.json' }));
  }

  return plugins;
}

module.exports = generatePlugins;
