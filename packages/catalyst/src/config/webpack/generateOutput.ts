import { Output } from 'webpack';
import Configuration from '../../Configuration';

export default function generateOutput(): Output {
  const {
    environment,
    buildPath,
    publicPath,
    devServerHost,
    devServerPort
  } = new Configuration();

  if (environment === 'development') {
    return {
      path: buildPath,
      publicPath: `http://${devServerHost}:${devServerPort}/`
    };
  }

  if (environment === 'test') {
    return {
      path: buildPath,
      publicPath,
      filename: '[name].js'
    };
  }

  return {
    path: buildPath,
    publicPath,
    filename: '[name]-[hash].js'
  };
}
