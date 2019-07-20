import path from 'path';
import Configuration from '../../Configuration';
import forEachPlugin from '../../utils/forEachPlugin';

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
  const configuration = new Configuration();

  const { environment, typeScriptEnabled, flowEnabled } = configuration;

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

  let presets: Array<string | [string, Object]> = [
    [require.resolve('@babel/preset-env'), presetEnvOptions],
    [require.resolve('@babel/preset-react'), { useBuiltIns: true }]
  ];

  if (typeScriptEnabled) {
    presets.push(require.resolve('@babel/preset-typescript'));
  }

  const absoluteRuntime = path.dirname(
    require.resolve('@babel/runtime/package.json')
  );

  let plugins: Array<string | [string, Object]> = [
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    [
      require.resolve('@babel/plugin-proposal-class-properties'),
      { loose: true }
    ],
    require.resolve('@babel/plugin-proposal-optional-chaining'),
    require.resolve('@babel/plugin-syntax-dynamic-import'),
    [
      require.resolve('@babel/plugin-transform-runtime'),
      { useESModules: true, absoluteRuntime }
    ]
  ];

  if (flowEnabled) {
    plugins.unshift(
      require.resolve('@babel/plugin-transform-flow-strip-types')
    );
  }

  if (environment === 'production') {
    plugins.push(require.resolve('babel-plugin-lodash'), [
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
      {
        removeImport: true
      }
    ]);
  }

  forEachPlugin((plugin) => {
    if (plugin.modifyBabelPresets != null) {
      presets = plugin.modifyBabelPresets(presets, configuration);
    }

    if (plugin.modifyBabelPlugins != null) {
      plugins = plugin.modifyBabelPlugins(plugins, configuration);
    }
  });

  return {
    presets,
    plugins
  };
}
