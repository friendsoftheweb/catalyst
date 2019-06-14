import chalk from 'chalk';
import WebpackDevServer from 'webpack-dev-server';
import buildVendorPackages from './buildVendorPackages';
import createDevServer from './createDevServer';
import { checkPortAvailability, rebuildNodeSASS } from '../../utils';
import Configuration from '../../Configuration';

export default async function server(): Promise<WebpackDevServer> {
  const { devServerHost, devServerPort, overlayEnabled } = new Configuration();

  await checkPortAvailability(devServerPort);
  await rebuildNodeSASS();
  await buildVendorPackages();

  const server = await createDevServer({
    host: devServerHost,
    port: devServerPort,
    overlayEnabled: overlayEnabled
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
