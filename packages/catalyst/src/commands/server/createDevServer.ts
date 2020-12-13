import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import Configuration from '../../Configuration';
import getWebpackConfig from '../../utils/getWebpackConfig';
import readCertificateFiles from './readCertificateFiles';

interface Options {
  host: string;
  port: number;
  protocol: string;
  certificate: {
    keyPath: string;
    certPath: string;
    caPath: string;
  } | null;
  overlayEnabled: boolean;
  bundleAnalyzerEnabled: boolean;
}

export default async function createDevServer(options: Options) {
  const {
    host,
    port,
    protocol,
    certificate,
    overlayEnabled,
    bundleAnalyzerEnabled,
  } = options;

  const { rootPath, tempPath } = new Configuration();

  const vendorFilePath = path.join(tempPath, 'vendor-dll.js');

  let https: WebpackDevServer.Configuration['https'] = protocol === 'https';

  if (certificate != null) {
    https = await readCertificateFiles(rootPath, certificate);
  }

  const configuration: WebpackDevServer.Configuration = {
    host,
    port,
    https,
    hot: true,
    publicPath: '/',
    clientLogLevel: 'none',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    disableHostCheck: true,
    stats: 'errors-only',
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

      app.get('/frame', (_req, res) => {
        res.set('Content-Type', 'text/html');
        res.set('Access-Control-Allow-Origin', '*');

        fs.readFile(
          require.resolve('catalyst-client/lib/frame.js'),
          (_error, data) => {
            // TODO: Handle error
            res.send(
              `<html>
                <head>
                  <style>
                    body {
                      margin: 0;
                      position: fixed;
                      width: 100vw;
                      height: 100vh;
                      position: fixed;
                      box-sizing: border-box;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                  </style>
                  <script>${data.toString()}</script>
                </head>
                <body></body>
              </html>`
            );
          }
        );
      });
    },
  };

  const webpackConfig = await getWebpackConfig({
    bundleAnalyzerEnabled,
  });

  // If the custom error overlay is disabled, add the standard webpack
  // development client.
  if (overlayEnabled === false) {
    WebpackDevServer.addDevServerEntrypoints(webpackConfig, configuration);
  }

  const compiler = webpack(webpackConfig);

  return new WebpackDevServer(compiler, configuration);
}
