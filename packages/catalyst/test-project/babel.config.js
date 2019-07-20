const path = require('path');

module.exports = function(api) {
  api.cache.never();

  const presets = [
    [
      path.resolve(__dirname, 'node_modules/catalyst/lib/babel-preset.js'),
      {
        corejs: 3
      }
    ]
  ];

  const plugins = [];

  return {
    presets,
    plugins
  };
};
