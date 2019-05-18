import path from 'path';
import { getEnvironment } from '../../utils';

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
  const environment = getEnvironment();

  if (modules == null) {
    modules = environment.isTest ? 'commonjs' : false;
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

  if (environment.typeScriptConfigExists) {
    presets.push('@babel/preset-typescript');
  }

  const absoluteRuntime = path.dirname(
    require.resolve('@babel/runtime/package.json')
  );

  const plugins = [
    '@babel/plugin-proposal-object-rest-spread',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-syntax-dynamic-import',
    'babel-plugin-graphql-tag',
    ['@babel/plugin-transform-runtime', { useESModules: true, absoluteRuntime }]
  ];

  if (environment.flowConfigExists) {
    plugins.unshift('@babel/plugin-transform-flow-strip-types');
  }

  if (environment.isProduction) {
    plugins.push(
      '@babel/plugin-transform-react-constant-elements',
      'babel-plugin-lodash'
    );
  }

  return {
    presets,
    plugins
  };
}
