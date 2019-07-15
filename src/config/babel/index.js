const { getEnvironment } = require('../../utils');

function babelConfig({ modules, corejs, useBuiltIns = 'usage' } = {}) {
  const environment = getEnvironment();

  if (modules == null) {
    modules = environment.test ? 'commonjs' : false;
  }

  const presetEnvOptions = {
    modules,
    useBuiltIns
  };

  if (corejs != null) {
    presetEnvOptions.corejs = corejs;
  }

  const presets = [
    ['@babel/preset-env', presetEnvOptions],
    ['@babel/preset-react', { useBuiltIns: true }]
  ];

  if (environment.typeScriptConfigExists) {
    presets.push('@babel/preset-typescript');
  }

  const plugins = [
    '@babel/plugin-proposal-object-rest-spread',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-transform-regenerator',
    '@babel/plugin-syntax-dynamic-import',
    'babel-plugin-graphql-tag'
  ];

  if (environment.flowConfigExists) {
    plugins.unshift('@babel/plugin-transform-flow-strip-types');
  }

  if (!environment.development) {
    plugins.push('@babel/plugin-transform-runtime');
  }

  if (environment.production) {
    plugins.push('babel-plugin-lodash');
  }

  return {
    presets,
    plugins
  };
}

module.exports = babelConfig;
