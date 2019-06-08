import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import WorkboxWebpackPlugin from 'workbox-webpack-plugin';
import { getEnvironment } from '../../utils';
import CleanUpStatsPlugin from '../../webpack-plugins/CleanUpStatsPlugin';
import { Options } from './index';

export default function generatePlugins(options: Options) {
  const environment = getEnvironment();
  const cssFileName = environment.isProduction
    ? '[name]-[hash].css'
    : '[name].css';
  const plugins = [];

  if (environment.isDevelopment) {
    plugins.push(
      new webpack.DllReferencePlugin({
        context: options.projectRoot,
        manifest: require(`${options.projectRoot}/tmp/catalyst/vendor.json`)
      }),
      new webpack.HotModuleReplacementPlugin()
    );
  }

  if (!environment.isDevelopment) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: cssFileName
      })
    );
  }

  plugins.push(
    new webpack.EnvironmentPlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      DEV_SERVER_HOST: environment.devServerHost,
      DEV_SERVER_PORT: environment.devServerPort
    })
  );

  if (environment.isProduction || environment.isTest) {
    plugins.push(new ManifestPlugin({ fileName: 'manifest.json' }));
  }

  if (environment.isProduction) {
    plugins.push(
      new CompressionPlugin({
        test: /\.(js|s?css)$/
      }),
      new WorkboxWebpackPlugin.GenerateSW({
        clientsClaim: true,
        exclude: [/\.map$/, /manifest\.json$/]
      })
    );
  }

  plugins.push(new CleanUpStatsPlugin());

  return plugins;
}
