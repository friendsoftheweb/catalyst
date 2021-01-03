import { Configuration as WebpackConfiguration } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import Configuration from '../../Configuration';

export default function generateOptimization(
  configuration: Configuration
): WebpackConfiguration['optimization'] {
  const {
    optimizeCommonMinChunks,
    optimizeCommonExcludedChunks,
  } = configuration;

  return {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          format: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      minChunks: optimizeCommonMinChunks,
      cacheGroups: {
        common: {
          test: /[\\/]node_modules[\\/]/,
          name: 'common',
          chunks(chunk) {
            return !optimizeCommonExcludedChunks.includes(chunk.name);
          },
        },
      },
    },
  };
}
