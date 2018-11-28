const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const chalk = require('chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const {
  getEnvironment,
  getDirectories,
  checkPortAvailability,
  rebuildNodeSASS
} = require('../../utils');

const webpackVendorConfigPath = path.resolve(
  __dirname,
  '../../config/webpack/dll-config.js'
);

async function server(options) {
  const {
    devServerHost,
    devServerPort,
    devServerHotPort,
    devClientPort
  } = getEnvironment();

  const directories = getDirectories();

  await checkPortAvailability(devServerPort, devServerHotPort);
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

  const config = require(path.join(directories.context, 'config/webpack.js'));
  const compiler = webpack(config);
  const vendorFilePath = path.join(directories.temp, 'vendor-dll.js');

  const server = new WebpackDevServer(compiler, {
    host: devServerHost,
    port: devServerPort,
    hot: options.hot,
    clientLogLevel: 'none',
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
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
