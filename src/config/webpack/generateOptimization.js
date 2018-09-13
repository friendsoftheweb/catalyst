function generateOptimization() {
  const optimization = {};

  optimization.splitChunks = {
    minChunks: 2,
    cacheGroups: {
      common: {
        test: /[\\/]node_modules[\\/]/,
        name: 'common',
        chunks: 'all'
      }
    }
  };

  return optimization;
}

module.exports = generateOptimization;
