const resolveModulePath = require('./utils/resolve-module-path');

module.exports = {
  presets: [
    [
      resolveModulePath('babel-preset-env'),
      {
        modules: false,
        targets: {
          browsers: ['last 2 versions', 'not IE <= 10']
        }
      }
    ],
    resolveModulePath('babel-preset-react'),
    resolveModulePath('babel-preset-stage-2')
  ],
  plugins: []
};
