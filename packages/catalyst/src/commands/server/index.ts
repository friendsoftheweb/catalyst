import chalk from 'chalk';
import WebpackDevServer from 'webpack-dev-server';

import buildVendorPackages from './buildVendorPackages';
import createDevServer from './createDevServer';

import {
  getEnvironment,
  getConfig,
  checkPortAvailability,
  rebuildNodeSASS
} from '../../utils';

export default async function server(): Promise<WebpackDevServer> {
  const { devServerHost, devServerPort } = getEnvironment();

  await checkPortAvailability(devServerPort);
  await rebuildNodeSASS();
  await buildVendorPackages();

  const { overlay } = getConfig();

  const server = createDevServer({
    host: devServerHost,
    port: devServerPort,
    overlay: overlay || false
  });

  return new Promise((resolve, reject) => {
    server.listen(devServerPort, devServerHost, (error) => {
      if (error) {
        console.log(error);
        reject(error);

        return;
      }

      resolve(server);

      console.log(
        `🧪 Catalyst server is now listening at ${chalk.cyan(
          `http://${devServerHost}:${devServerPort}`
        )}\n`
      );

      const signals: Array<'SIGINT' | 'SIGTERM'> = ['SIGINT', 'SIGTERM'];

      signals.forEach((signal) => {
        process.on(signal, () => {
          server.close();
          process.exit();
        });
      });
    });
  });
}
