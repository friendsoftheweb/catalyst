import path from 'path';
import fs from 'fs';
import util from 'util';
import webpack from 'webpack';
import WebpackDevServer, {
  Configuration as WebpackDevServerConfiguration,
} from 'webpack-dev-server';
import Configuration from '../../Configuration';
import getWebpackConfig from '../../utils/getWebpackConfig';
import readCertificateFiles from './readCertificateFiles';

const readFile = util.promisify(fs.readFile);

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
    certificate,
    overlayEnabled,
    bundleAnalyzerEnabled,
  } = options;

  const { rootPath, tempPath } = Configuration.fromFile();

  const vendorFilePath = path.join(tempPath, 'vendor-dll.js');

  let https: WebpackDevServerConfiguration['https'];

  if (certificate != null) {
    https = await readCertificateFiles(rootPath, certificate);
  }

  const configuration: WebpackDevServerConfiguration = {
    host,
    port,
    https,
    hot: true,
    client: {
      logging: 'error',
      overlay: false,
    },
    headers: {
      'Access-Control-Allow-Credentials': 'true',
    },

    onBeforeSetupMiddleware({ app }) {
      app.use((req, res, next) => {
        if (
          req.headers.referer != null &&
          /^https?:\/\/localhost:\d+\//.test(req.headers.referer)
        ) {
          res.setHeader(
            'Access-Control-Allow-Origin',
            new URL(req.headers.referer).origin
          );
        }

        next();
      });

      app.get('/vendor-dll.js', async (_req, res) => {
        const data = await readFile(vendorFilePath);

        res.set('Content-Type', 'application/javascript');
        res.send(data);
      });
    },
    onAfterSetupMiddleware({ app }) {
      // Add a route to fall back to during development if "common.js" is not
      // generated (because it's unnecessary).
      app.get('/common.js', (_req, res) => {
        res.set('Content-Type', 'application/javascript');
        res.send('// This file left intentially blank.');
      });

      app.get('/frame', async (_req, res) => {
        res.set('Content-Type', 'text/html');

        let scriptTag = '';

        if (process.env.CATALYST_CLIENT_SCRIPT_URL) {
          scriptTag = `<script src="${process.env.CATALYST_CLIENT_SCRIPT_URL}"></script>`;
        } else {
          const data = await readFile(
            require.resolve('catalyst-client/lib/frame.js')
          );

          scriptTag = `<script>${data.toString()}</script>`;
        }

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
               ${scriptTag}
             </head>
             <body></body>
           </html>`
        );
      });

      app.get('/mappings.wasm', async (_req, res) => {
        const data = readFile(
          require.resolve(
            'catalyst-client/node_modules/source-map/lib/mappings.wasm'
          )
        );

        res.send(data);
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
