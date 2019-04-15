const { getEnvironment, resolveModulePath } = require('../../utils');

function babelConfig({ modules, corejs, useBuiltIns = 'usage' } = {}) {
  const environment = getEnvironment();

  if (modules == null) {
    modules = environment.test ? 'commonjs' : false;
  }

  const presets = [
    [
      resolveModulePath('@babel/preset-env'),
      {
        modules,
        useBuiltIns,
        corejs
      }
    ],
    resolveModulePath('@babel/preset-react', { useBuiltIns: true })
  ];

  if (environment.typeScriptConfigExists) {
    presets.push(resolveModulePath('@babel/preset-typescript'));
  }

  const plugins = [
    resolveModulePath('@babel/plugin-proposal-object-rest-spread'),
    [
      resolveModulePath('@babel/plugin-proposal-class-properties'),
      { loose: true }
    ],
    resolveModulePath('@babel/plugin-proposal-optional-chaining'),
    resolveModulePath('@babel/plugin-transform-regenerator'),
    resolveModulePath('@babel/plugin-syntax-dynamic-import')
  ];

  if (environment.flowConfigExists) {
    plugins.unshift(
      resolveModulePath('@babel/plugin-transform-flow-strip-types')
    );
  }

  if (environment.production) {
    plugins.push(
      resolveModulePath('@babel/plugin-transform-react-constant-elements'),
      resolveModulePath('babel-plugin-lodash')
    );
  }

  return {
    presets,
    plugins
  };
}

module.exports = babelConfig;
