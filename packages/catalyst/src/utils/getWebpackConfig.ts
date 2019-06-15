import fs from 'fs';
import path from 'path';
import { Configuration as WebpackConfiguration } from 'webpack';

import Configuration from '../Configuration';
import generateWebpackConfig from '../config/webpack';

export default async function getWebpackConfig(): Promise<
  WebpackConfiguration
> {
  const { rootPath } = new Configuration();
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
