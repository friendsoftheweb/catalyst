import { Configuration as WebpackConfiguration } from 'webpack';
import Configuration from '../../Configuration';
import { Environment } from '../../Environment';

export default function generateOutput(): WebpackConfiguration['output'] {
  const {
    environment,
    buildPath,
    publicPath,
    devServerHost,
    devServerPort,
  } = new Configuration();

  if (environment === Environment.Development) {
    return {
      path: buildPath,
      publicPath: `http://${devServerHost}:${devServerPort}/`,
    };
  }

  if (environment === Environment.Test) {
    return {
      path: buildPath,
      publicPath,
      filename: '[name].js',
    };
  }

  return {
    path: buildPath,
    publicPath,
    filename: '[name].[contenthash:8].js',
  };
}
