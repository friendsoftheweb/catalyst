import fs from 'fs';
import path from 'path';
import { Configuration as WebpackConfiguration } from 'webpack';

import Configuration from '../configuration';
import generateWebpackConfig from '../config/webpack';

const { rootPath } = new Configuration();

export default async function getWebpackConfig(): Promise<
  WebpackConfiguration
> {
  const webpackConfigPath = path.join(rootPath, 'webpack.config.js');

  return new Promise((resolve) => {
    fs.exists(webpackConfigPath, (exists) => {
      if (exists) {
        resolve(require(webpackConfigPath));
      } else {
        resolve(generateWebpackConfig());
      }
    });
  });
}
