const environment = require('./utils/environment');
const resolveModulePath = require('./utils/resolve-module-path');

module.exports = {
  presets: [
    [
      resolveModulePath('babel-preset-es2015'),
      {
        modules: false
      }
    ],
    resolveModulePath('babel-preset-react'),
    resolveModulePath('babel-preset-stage-2')
  ],
  plugins: []
};
