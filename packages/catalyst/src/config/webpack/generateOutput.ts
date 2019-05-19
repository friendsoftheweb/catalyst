import { Output } from 'webpack';
import path from 'path';
import { getEnvironment } from '../../utils';

import { Options } from './index';

export default function generateOutput({
  context,
  buildPath
}: Options): Output {
  const environment = getEnvironment();

  if (environment.isDevelopment) {
    return {
      path: path.join(context, 'app', 'assets'),
      publicPath: `http://${environment.devServerHost}:${
        environment.devServerPort
      }/`
    };
  } else {
    return {
      path: buildPath,
      publicPath: '/assets/',
      filename: '[name]-[hash].js'
    };
  }
}
