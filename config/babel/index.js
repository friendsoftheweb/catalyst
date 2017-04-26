const resolveModulePath = require('../../utils/resolve-module-path');
const environment = require('../../utils/environment');

function babelConfig(modules = 'commonjs') {
  const env = environment();
  const plugins = [
    resolveModulePath('babel-plugin-transform-flow-strip-types'),
    resolveModulePath('babel-plugin-transform-decorators-legacy'),
    resolveModulePath('babel-plugin-transform-class-properties'),
    resolveModulePath('babel-plugin-transform-regenerator')
  ];

  if (env.production) {
    plugins.push(resolveModulePath('babel-plugin-transform-react-constant-elements'));
  }

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
    plugins
  };
}

module.exports = babelConfig;
