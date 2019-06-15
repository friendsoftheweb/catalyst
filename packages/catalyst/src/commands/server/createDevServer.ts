import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import Configuration from '../../Configuration';
import getWebpackConfig from '../../utils/getWebpackConfig';

interface Options {
  host: string;
  port: number;
  overlayEnabled: boolean;
}

export default async function createDevServer({
  host,
  port,
  overlayEnabled
}: Options) {
  const { tempPath } = new Configuration();

  const vendorFilePath = path.join(tempPath, 'vendor-dll.js');

  const configuration: WebpackDevServer.Configuration = {
    host,
    port,
    hot: true,
    publicPath: '/',
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

  const webpackConfig = await getWebpackConfig();

  // If the custom error overlay is disabled, add the standard webpack
  // development client.
  if (overlayEnabled === false) {
    WebpackDevServer.addDevServerEntrypoints(webpackConfig, configuration);
  }

  const compiler = webpack(webpackConfig);

  return new WebpackDevServer(compiler, configuration);
}
