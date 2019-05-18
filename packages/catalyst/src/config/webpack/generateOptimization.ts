import { Options } from 'webpack';

export default function generateOptimization(): Options.Optimization {
  return {
    splitChunks: {
      minChunks: 2,
      cacheGroups: {
        common: {
          test: /[\\/]node_modules[\\/]/,
          name: 'common',
          chunks: 'all'
        }
      }
    }
  };
}
