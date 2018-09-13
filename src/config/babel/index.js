const { getEnvironment, resolveModulePath } = require('../../utils');

function babelConfig({ modules = false, useBuiltIns = 'usage' } = {}) {
  const environment = getEnvironment();

  const plugins = [
    resolveModulePath('@babel/plugin-transform-flow-strip-types'),
    resolveModulePath('@babel/plugin-proposal-object-rest-spread'),
    [
      resolveModulePath('@babel/plugin-proposal-class-properties'),
      { loose: true }
    ],
    resolveModulePath('@babel/plugin-proposal-optional-chaining'),
    resolveModulePath('@babel/plugin-transform-regenerator')
  ];

  if (environment.production) {
    plugins.push(
      resolveModulePath('@babel/plugin-transform-react-constant-elements'),
      resolveModulePath('babel-plugin-lodash')
    );
  }

  return {
    presets: [
      [
        resolveModulePath('@babel/preset-env'),
        {
          modules,
          useBuiltIns
        }
      ],
      resolveModulePath('@babel/preset-react', { useBuiltIns: true })
    ],
    plugins
  };
}

module.exports = babelConfig;
