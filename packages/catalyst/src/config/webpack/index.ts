import { reduce } from 'lodash';
import { Configuration as WebpackConfiguration } from 'webpack';
import generateDevtool from './generateDevtool';
import generateEntryForBundleName from './generateEntryForBundleName';
import generateOutput from './generateOutput';
import generatePlugins from './generatePlugins';
import generateRules from './generateRules';
import generateOptimization from './generateOptimization';
import bundlePaths from './bundlePaths';
import Configuration, { Environment } from '../../Configuration';

interface Options {
  bundleAnalyzerEnabled?: boolean;
}

export default function webpackConfig(options?: Options): WebpackConfiguration {
  const { environment, contextPath } = new Configuration();

  return {
    context: contextPath,
    mode: environment === Environment.Production ? 'production' : 'development',
    devtool: generateDevtool(),
    entry: reduce(
      bundlePaths(),
      (entry, bundlePath) => {
        const parts = bundlePath.split('/');
        const bundleName = parts[parts.length - 1];

        return Object.assign({}, entry, {
          [bundleName]: generateEntryForBundleName(bundleName),
        });
      },
      {}
    ),
    output: generateOutput(),
    resolve: {
      extensions: ['.wasm', '.mjs', '.js', '.ts', '.tsx', '.json'],
      modules: [contextPath, 'node_modules'],
    },
    plugins: generatePlugins(options),
    module: {
      rules: generateRules(),
    },
    optimization: generateOptimization(),
  };
}
