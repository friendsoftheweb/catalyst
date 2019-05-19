import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

import createDevServer from './createDevServer';

import {
  getEnvironment,
  getConfig,
  checkPortAvailability,
  rebuildNodeSASS
} from '../../utils';

const webpackVendorConfigPath = path.resolve(
  __dirname,
  '../../config/webpack/dll-config.js'
);

export default async function server() {
  const { devServerHost, devServerPort } = getEnvironment();

  await checkPortAvailability(devServerPort);
  await rebuildNodeSASS();

  console.log(chalk.cyan('\nPrebuilding vendor packages...\n'));

  // execSync(
  //   [
  //     'webpack',
  //     `--config=${webpackVendorConfigPath}`,
  //     '--display-error-details',
  //     '--hide-modules',
  //     '--bail',
  //     '--color'
  //   ].join(' ')
  // );

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

      resolve();

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

module.exports = server;
