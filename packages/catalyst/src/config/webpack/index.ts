import fs from 'fs';
import path from 'path';
import { reduce } from 'lodash';
import { Configuration } from 'webpack';
import { getEnvironment, getConfig, getDirectories } from '../../utils';
import generateDevtool from './generateDevtool';
import generateEntryForBundleName from './generateEntryForBundleName';
import generateOutput from './generateOutput';
import generatePlugins from './generatePlugins';
import generateRules from './generateRules';
import generateOptimization from './generateOptimization';

export interface Options {
  context: string;
  projectRoot: string;
  buildPath: string;
  publicPath: string;
  transformModules: string[];
}

const defaultOptions: Partial<Options> = {
  publicPath: '/assets/',
  transformModules: [
    '@reach/router',
    'apollo-cache-inmemory',
    'apollo-client',
    'apollo-link',
    'apollo-link-http',
    'axios',
    'luxon',
    'react',
    'react-apollo',
    'react-dom',
    'react-router',
    'react-router-dom',
    'react-transition-group',
    'redux',
    'redux-saga'
  ]
};

export default function webpackConfig(options: Options): Configuration {
  const env = getEnvironment();
  const config = getConfig();
  const directories = getDirectories();

  const optionsWithDefaults: Options = {
    context: directories.context,
    projectRoot: directories.project,
    buildPath: directories.build,
    ...defaultOptions,
    ...options
  };

  const bundlePaths = fs
    .readdirSync(directories.bundles)
    .map((bundlePath) => path.join(directories.bundles, bundlePath))
    .filter((bundlePath) => fs.statSync(bundlePath).isDirectory());

  return {
    context: directories.context,
    mode: env.isProduction ? 'production' : 'development',
    devtool: generateDevtool(),
    entry: reduce(
      bundlePaths,
      (entry, bundlePath) => {
        const parts = bundlePath.split('/');
        const bundleName = parts[parts.length - 1];

        return Object.assign({}, entry, {
          [bundleName]: generateEntryForBundleName(bundleName)
        });
      },
      {}
    ),
    output: generateOutput(optionsWithDefaults),
    resolve: {
      extensions: ['.wasm', '.mjs', '.js', '.ts', '.tsx', '.json'],
      modules: [config.rootPath, 'node_modules']
    },
    plugins: generatePlugins(optionsWithDefaults),
    module: {
      rules: generateRules(optionsWithDefaults)
    },
    optimization: generateOptimization()
  };
}
