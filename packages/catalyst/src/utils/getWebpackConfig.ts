import fs from 'fs';
import path from 'path';
import { Configuration as WebpackConfiguration } from 'webpack';

import Configuration from '../Configuration';
import generateWebpackConfig from '../config/webpack';

interface Options {
  bundleAnalyzerEnabled?: boolean;
}

export default async function getWebpackConfig(
  options?: Options
): Promise<WebpackConfiguration> {
  const { rootPath } = new Configuration();
  const webpackConfigPath = path.join(rootPath, 'webpack.config.js');

  return new Promise((resolve) => {
    fs.exists(webpackConfigPath, (exists) => {
      if (exists) {
        resolve(require(webpackConfigPath));
      } else {
        resolve(generateWebpackConfig(options));
      }
    });
  });
}
