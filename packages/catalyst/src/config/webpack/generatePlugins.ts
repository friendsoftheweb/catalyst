import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import WorkboxWebpackPlugin from 'workbox-webpack-plugin';
import CleanUpStatsPlugin from '../../webpack-plugins/CleanUpStatsPlugin';
import Configuration from '../../Configuration';

export default function generatePlugins() {
  const { environment, contextPath, tempPath } = new Configuration();

  const cssFileName =
    environment === 'production' ? '[name]-[hash].css' : '[name].css';

  const plugins = [];

  if (environment === 'development') {
    plugins.push(
      new webpack.DllReferencePlugin({
        context: contextPath,
        manifest: require(path.join(tempPath, 'vendor.json'))
      }),
      new webpack.HotModuleReplacementPlugin()
    );
  }

  if (environment !== 'development') {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: cssFileName
      })
    );
  }

  plugins.push(
    new webpack.EnvironmentPlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    })
  );

  if (environment !== 'development') {
    plugins.push(new ManifestPlugin({ fileName: 'manifest.json' }));
  }

  if (environment === 'production') {
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
