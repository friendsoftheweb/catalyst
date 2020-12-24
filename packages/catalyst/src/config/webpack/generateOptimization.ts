import { Configuration as WebpackConfiguration } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

export default function generateOptimization(): WebpackConfiguration['optimization'] {
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
      minChunks: 2,
      cacheGroups: {
        common: {
          test: /[\\/]node_modules[\\/]/,
          name: 'common',
          chunks: 'all',
        },
      },
    },
  };
}
