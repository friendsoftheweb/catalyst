import path from 'path';
import Configuration from '../../Configuration';
import { Environment } from '../../Environment';
import forEachPlugin from '../../utils/forEachPlugin';

interface Options {
  configuration?: Configuration;
  modules?: 'amd' | 'umd' | 'systemjs' | 'commonjs' | 'cjs' | 'auto' | false;
  targets?: { [key: string]: string };
  corejs?: 2 | 3;
  useBuiltIns?: 'usage' | 'entry' | false;
}

export default function babelConfig(options: Options = {}) {
  const {
    configuration = Configuration.fromFile(),
    targets,
    corejs,
    useBuiltIns = 'usage',
  } = options;

  let { modules } = options;

  const { environment, typeScriptEnabled, useReactJSXRuntime } = configuration;

  if (modules == null) {
    modules = environment === Environment.Test ? 'commonjs' : false;
  }

  const presetEnvOptions: Options = {
    modules,
    useBuiltIns,
  };

  if (targets != null) {
    presetEnvOptions.targets = targets;
  }

  if (corejs != null) {
    presetEnvOptions.corejs = corejs;
  }

  let presets: Array<string | [string, Record<string, unknown>]> = [
    [
      require.resolve('@babel/preset-env'),
      presetEnvOptions as Record<string, unknown>,
    ],
    [
      require.resolve('@babel/preset-react'),
      {
        useBuiltIns: true,
        development:
          environment === Environment.Development ||
          environment === Environment.Test,
        runtime: useReactJSXRuntime ? 'automatic' : 'classic',
      },
    ],
  ];

  if (typeScriptEnabled) {
    presets.push(require.resolve('@babel/preset-typescript'));
  }

  const absoluteRuntime = path.dirname(
    require.resolve('@babel/runtime/package.json')
  );

  let plugins: Array<string | [string, Record<string, unknown>]> = [
    [
      require.resolve('@babel/plugin-transform-runtime'),
      { useESModules: modules === false, absoluteRuntime },
    ],
  ];

  if (environment === Environment.Production) {
    plugins.push(require.resolve('babel-plugin-lodash'), [
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
      {
        removeImport: true,
      },
    ]);
  }

  forEachPlugin(configuration, (plugin) => {
    if (plugin.modifyBabelPresets != null) {
      presets = plugin.modifyBabelPresets(presets, configuration);
    }

    if (plugin.modifyBabelPlugins != null) {
      plugins = plugin.modifyBabelPlugins(plugins, configuration);
    }
  });

  return {
    presets,
    plugins,
  };
}
