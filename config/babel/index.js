const resolveModulePath = require('../../utils/resolve-module-path');

function babelConfig(modules = 'commonjs') {
  return {
    presets: [
      [
        resolveModulePath('babel-preset-es2015'),
        {
          modules
        }
      ],
      resolveModulePath('babel-preset-react'),
      resolveModulePath('babel-preset-stage-2')
    ],
    plugins: []
  };
}

module.exports = babelConfig;
