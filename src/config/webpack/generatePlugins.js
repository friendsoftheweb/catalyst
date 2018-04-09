const webpack = require('webpack');
const { getEnvironment, resolveModulePath } = require('../../utils');
const MiniCssExtractPlugin = require(resolveModulePath(
  'mini-css-extract-plugin'
));
const ManifestPlugin = require(resolveModulePath('webpack-manifest-plugin'));

function generatePlugins(options = {}) {
  const environment = getEnvironment();
  const cssFileName = environment.production
    ? '[name]-[hash].css'
    : '[name].css';
  const plugins = [];

  if (environment.development) {
    plugins.push(
      new webpack.DllReferencePlugin({
        context: options.projectRoot,
        manifest: require(`${options.projectRoot}/tmp/catalyst/vendor.json`)
      })
    );
  }

  if (!environment.development) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: cssFileName
      })
    );
  }

  plugins.push(
    new webpack.EnvironmentPlugin({
      DEV_SERVER_HOST: environment.devServerHost,
      DEV_SERVER_HOT_PORT: environment.devServerHotPort
    })
  );

  if (environment.production || environment.test) {
    plugins.push(new ManifestPlugin({ fileName: 'manifest.json' }));
  }

  return plugins;
}

module.exports = generatePlugins;