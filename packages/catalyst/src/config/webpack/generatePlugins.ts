import path from 'path';
import webpack, { Plugin as WebpackPlugin } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import WorkboxWebpackPlugin from 'workbox-webpack-plugin';
import DuplicatePackageCheckerPlugin from 'duplicate-package-checker-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import PrefetchManifestPlugin from './plugins/PrefetchManifestPlugin';
import CleanUpStatsPlugin from './plugins/CleanUpStatsPlugin';
import Configuration from '../../Configuration';
import { Environment } from '../../Environment';
import forEachPlugin from '../../utils/forEachPlugin';

interface Options {
  bundleAnalyzerEnabled?: boolean;
}

export default function generatePlugins(options?: Options): WebpackPlugin[] {
  const configuration = new Configuration();

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

  let plugins: WebpackPlugin[] = [];

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
      SERVICE_WORKER_URL: `${publicPath}service-worker.js`,
    })
  );

  if (generateServiceWorker) {
    plugins.push(
      new WorkboxWebpackPlugin.GenerateSW({
        clientsClaim: true,
        exclude: [/\.map$/, /manifest\.json$/],
      })
    );
  }

  if (environment !== Environment.Development) {
    plugins.push(
      new PrefetchManifestPlugin(),
      new ManifestPlugin({ fileName: 'manifest.json' })
    );
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
      })
    );
  }

  plugins.push(new CaseSensitivePathsPlugin(), new CleanUpStatsPlugin());

  if (options != null && options.bundleAnalyzerEnabled) {
    plugins.push(new BundleAnalyzerPlugin());
  }

  forEachPlugin((plugin) => {
    if (plugin.modifyWebpackPlugins != null) {
      plugins = plugin.modifyWebpackPlugins(plugins, configuration);
    }
  });

  return plugins;
}
