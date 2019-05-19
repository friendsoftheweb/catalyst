import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import { getDirectories } from '../../utils';
import getWebpackConfig from './getWebpackConfig';

interface Options {
  host: string;
  port: number;
  overlay: boolean;
}

export default function createDevServer({ host, port, overlay }: Options) {
  const directories = getDirectories();
  const vendorFilePath = path.join(directories.temp, 'vendor-dll.js');

  const configuration: WebpackDevServer.Configuration = {
    host,
    port,
    hot: true,
    clientLogLevel: 'none',
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    disableHostCheck: true,
    before(app) {
      app.get('/vendor-dll.js', (req, res) => {
        fs.readFile(vendorFilePath, (err, data) => {
          if (err) {
            throw err;
          }

          res.set('Content-Type', 'application/javascript');
          res.set('Access-Control-Allow-Origin', '*');
          res.send(data);
        });
      });
    },
    after(app) {
      // Add a route to fall back to during development if "common.js" is not
      // generated (because it's unnecessary).
      app.get('/common.js', (req, res) => {
        res.set('Content-Type', 'application/javascript');
        res.set('Access-Control-Allow-Origin', '*');
        res.send('// This file left intentially blank.');
      });
    }
  };

  const config = getWebpackConfig();

  // If the custom error overlay is disabled, add the standard webpack
  // development client.
  if (overlay === false) {
    WebpackDevServer.addDevServerEntrypoints(config, configuration);
  }

  const compiler = webpack(config);

  return new WebpackDevServer(compiler, configuration);
}
