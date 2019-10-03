import chalk from 'chalk';
import WebpackDevServer from 'webpack-dev-server';
import prebuildVendorPackages from './prebuildVendorPackages';
import createDevServer from './createDevServer';
import rebuildNodeSASS from '../../utils/rebuildNodeSASS';
import checkPortAvailability from '../../utils/checkPortAvailability';
import Configuration from '../../Configuration';

export default async function server(): Promise<WebpackDevServer> {
  const {
    devServerHost,
    devServerPort,
    devServerProtocol,
    devServerCertificate,
    overlayEnabled
  } = new Configuration();

  await checkPortAvailability(devServerPort);
  await rebuildNodeSASS();
  await prebuildVendorPackages();

  const server = await createDevServer({
    host: devServerHost,
    port: devServerPort,
    protocol: devServerProtocol,
    certificate: devServerCertificate,
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
          `${devServerProtocol}://${devServerHost}:${devServerPort}`
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
