const { getEnvironment, resolveModulePath } = require('../../utils');

function babelConfig({ modules = false, useBuiltIns = 'usage' }) {
  const environment = getEnvironment();

  const plugins = [
    resolveModulePath('@babel/plugin-transform-flow-strip-types'),
    resolveModulePath('@babel/plugin-proposal-decorators'),
    [resolveModulePath('@babel/plugin-proposal-class-properties'), {}],
    resolveModulePath('@babel/plugin-transform-regenerator')
  ];

  if (environment.production) {
    plugins.push(
      resolveModulePath('@babel/plugin-transform-react-constant-elements')
    );
  }

  return {
    presets: [
      [
        resolveModulePath('@babel/preset-env'),
        {
          modules,
          useBuiltIns,
          // Until UglifyJS supports ES6+ syntax, we must force transforms in
          // the production environment.
          forceAllTransforms: env.production
        }
      ],
      resolveModulePath('@babel/preset-react'),
      resolveModulePath('@babel/preset-stage-2')
    ],
    plugins
  };
}

module.exports = babelConfig;
