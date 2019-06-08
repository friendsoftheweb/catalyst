import path from 'path';
import Configuration from '../../Configuration';

const { environment, typeScriptEnabled, flowEnabled } = new Configuration();

interface Options {
  useBuiltIns?: 'usage' | 'entry' | false;
  modules?: 'amd' | 'umd' | 'systemjs' | 'commonjs' | 'cjs' | 'auto' | false;
  corejs?: 2 | 3;
}

export default function babelConfig({
  modules,
  corejs,
  useBuiltIns = 'usage'
}: Options = {}) {
  if (modules == null) {
    modules = environment === 'test' ? 'commonjs' : false;
  }

  const presetEnvOptions: Options = {
    modules,
    useBuiltIns
  };

  if (corejs != null) {
    presetEnvOptions.corejs = corejs;
  }

  const presets: Array<string | [string, Object]> = [
    ['@babel/preset-env', presetEnvOptions],
    ['@babel/preset-react', { useBuiltIns: true }]
  ];

  if (typeScriptEnabled) {
    presets.push('@babel/preset-typescript');
  }

  const absoluteRuntime = path.dirname(
    require.resolve('@babel/runtime/package.json')
  );

  const plugins: Array<string | [string, Object]> = [
    '@babel/plugin-proposal-object-rest-spread',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-syntax-dynamic-import',
    'babel-plugin-graphql-tag',
    ['@babel/plugin-transform-runtime', { useESModules: true, absoluteRuntime }]
  ];

  if (flowEnabled) {
    plugins.unshift('@babel/plugin-transform-flow-strip-types');
  }

  if (environment === 'production') {
    plugins.push('babel-plugin-lodash', [
      'babel-plugin-transform-react-remove-prop-types',
      {
        removeImport: true
      }
    ]);
  }

  return {
    presets,
    plugins
  };
}
