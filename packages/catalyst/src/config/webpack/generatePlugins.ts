import path from 'path';
import webpack, { WebpackPluginInstance } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import WorkboxWebpackPlugin from 'workbox-webpack-plugin';
import DuplicatePackageCheckerPlugin from 'duplicate-package-checker-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CatalystManifestPlugin from './plugins/CatalystManifestPlugin';
import CleanUpStatsPlugin from './plugins/CleanUpStatsPlugin';
import Configuration from '../../Configuration';
import { Environment } from '../../Environment';
import forEachPlugin from '../../utils/forEachPlugin';

interface Options {
  bundleAnalyzerEnabled?: boolean;
}

export default function generatePlugins(
  configuration: Configuration,
  options?: Options
): WebpackPluginInstance[] {
  const {
    environment,
    contextPath,
    publicPath,
    tempPath,
    generateServiceWorker,
    checkForCircularDependencies,
    checkForDuplicatePackages,
    ignoredDuplicatePackages,
    devServerProtocol,
    devServerHost,
    devServerPort,
  } = configuration;

  const cssFileName =
    environment === Environment.Production
      ? '[name].[contenthash:8].css'
      : '[name].css';

  let plugins: WebpackPluginInstance[] = [];

  if (environment === Environment.Development) {
    plugins.push(
      new webpack.DllReferencePlugin({
        context: contextPath,
        manifest: require(path.join(tempPath, 'vendor.json')),
      }),
      new webpack.HotModuleReplacementPlugin()
    );
  }

  if (environment !== Environment.Development) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: cssFileName,
      })
    );
  }

  plugins.push(
    new webpack.EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV,
      DEV_SERVER_PROTOCOL: devServerProtocol,
      DEV_SERVER_HOST: devServerHost,
      DEV_SERVER_PORT: devServerPort,
      CONTEXT_PATH: contextPath,
      SERVICE_WORKER_URL: `${publicPath}service-worker.js`,
    })
  );

  if (generateServiceWorker) {
    plugins.push(
      new WorkboxWebpackPlugin.GenerateSW({
        clientsClaim: true,
        exclude: [/\.map$/, /catalyst\.manifest\.json$/],
      })
    );
  }

  if (environment !== Environment.Development) {
    plugins.push(new CatalystManifestPlugin());
  }

  if (environment === Environment.Production) {
    plugins.push(
      new CompressionPlugin({
        test: /\.(js|css)$/,
      })
    );
  }

  if (checkForCircularDependencies) {
    plugins.push(
      new CircularDependencyPlugin({
        exclude: /.*\/node_modules\/.*/,
        failOnError: environment !== Environment.Development,
        allowAsyncCycles: true,
        cwd: process.cwd(),
      })
    );
  }

  if (checkForDuplicatePackages) {
    plugins.push(
      new DuplicatePackageCheckerPlugin({
        exclude(instance) {
          return ignoredDuplicatePackages.includes(instance.name);
        },
      }),
      new DuplicatePackageCheckerPlugin({
        verbose: true,
        emitError: true,
        exclude(instance) {
          return (
            ignoredDuplicatePackages.includes(instance.name) ||
            !['react', 'react-dom', 'graphql', '@apollo/client'].includes(
              instance.name
            )
          );
        },
      })
    );
  }

  plugins.push(new CaseSensitivePathsPlugin(), new CleanUpStatsPlugin());

  if (options != null && options.bundleAnalyzerEnabled) {
    plugins.push(new BundleAnalyzerPlugin());
  }

  forEachPlugin(configuration, (plugin) => {
    if (plugin.modifyWebpackPlugins != null) {
      plugins = plugin.modifyWebpackPlugins(plugins, configuration);
    }
  });

  return plugins;
}
