const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const chalk = require('chalk');

const createDevServer = require('./createDevServer');

const {
  getEnvironment,
  getDirectories,
  getConfig,
  checkPortAvailability,
  rebuildNodeSASS
} = require('../../utils');

const webpackVendorConfigPath = path.resolve(
  __dirname,
  '../../config/webpack/dll-config.js'
);

async function server(options) {
  const { devServerHost, devServerPort } = getEnvironment();

  await checkPortAvailability(devServerPort);
  await rebuildNodeSASS();

  console.log(chalk.cyan('\nPrebuilding vendor packages...\n'));

  execSync(
    [
      'webpack',
      `--config=${webpackVendorConfigPath}`,
      '--display-error-details',
      '--hide-modules',
      '--bail',
      '--color'
    ].join(' ')
  );

  const { overlay } = getConfig();

  const server = createDevServer({
    host: devServerHost,
    port: devServerPort,
    overlay
  });

  server.listen(devServerPort, devServerHost, error => {
    if (error) {
      return console.log(error);
    }

    console.log(
      `🧪 Catalyst server is now listening at ${chalk.cyan(
        `http://${devServerHost}:${devServerPort}`
      )}\n`
    );

    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, () => {
        server.close();
        process.exit();
      });
    });
  });
}

module.exports = server;
