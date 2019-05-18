import { Output } from 'webpack';
import path from 'path';
import { getEnvironment } from '../../utils';

import { Options } from './index';

export default function generateOutput({
  context,
  buildPath
}: Options): Output {
  const environment = getEnvironment();
  const output: Output = {};

  if (environment.isProduction) {
    output.path = buildPath;
    output.filename = '[name]-[hash].js';
  } else if (environment.isTest) {
    output.path = buildPath;
    output.filename = '[name].js';
  } else {
    output.path = path.join(context, 'app', 'assets');
    output.filename = '[name].js';
    output.publicPath = `http://${environment.devServerHost}:${
      environment.devServerPort
    }/`;
  }

  return output;
}
