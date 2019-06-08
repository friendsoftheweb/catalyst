import { Output } from 'webpack';
import Configuration from '../../Configuration';

const {
  environment,
  buildPath,
  publicPath,
  devServerHost,
  devServerPort
} = new Configuration();

export default function generateOutput(): Output {
  if (environment === 'development') {
    return {
      path: buildPath,
      publicPath: `http://${devServerHost}:${devServerPort}/`
    };
  } else {
    return {
      path: buildPath,
      publicPath,
      filename: '[name]-[hash].js'
    };
  }
}
