import { Configuration as WebpackConfiguration } from 'webpack';
import generateDevtool from './generateDevtool';
import generateEntryForBundleName from './generateEntryForBundleName';
import generateOutput from './generateOutput';
import generatePlugins from './generatePlugins';
import generateRules from './generateRules';
import generateOptimization from './generateOptimization';
import bundlePaths from './bundlePaths';
import Configuration from '../../Configuration';
import { Environment } from '../../Environment';

interface Options {
  configuration?: Configuration;
  bundleAnalyzerEnabled?: boolean;
}

export default function webpackConfig(
  options: Options = {}
): WebpackConfiguration {
  const configuration = options.configuration ?? Configuration.fromFile();

  const { environment, contextPath } = configuration;

  return {
    context: contextPath,
    mode: environment === Environment.Production ? 'production' : 'development',
    devtool: generateDevtool(configuration),
    entry: bundlePaths(configuration).reduce((entry, bundlePath) => {
      const parts = bundlePath.split('/');
      const bundleName = parts[parts.length - 1];

      return {
        ...entry,
        [bundleName]: generateEntryForBundleName(configuration, bundleName),
      };
    }, {}),
    output: generateOutput(configuration),
    resolve: {
      extensions: ['.wasm', '.mjs', '.js', '.ts', '.tsx', '.json'],
      modules: [contextPath, 'node_modules'],
    },
    plugins: generatePlugins(configuration, options),
    module: {
      rules: generateRules(configuration),
    },
    optimization: generateOptimization(configuration),
    bail: true,
  };
}
