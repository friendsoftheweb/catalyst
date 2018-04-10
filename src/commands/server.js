const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { get, map, uniq } = require('lodash/fp');
const serve = require('webpack-serve');
const Router = require('koa-router');
const findProcess = require('find-process');
const { getDirectories, getEnvironment, log } = require('../utils');

async function server(options) {
  const { devServerHost, devServerPort, devServerHotPort } = getEnvironment();

  const serverProcesses = await findProcess('port', devServerPort);
  const serverHotProcesses = await findProcess('port', devServerHotPort);

  if (serverProcesses.length > 0 || serverHotProcesses > 0) {
    const processIDs = uniq([
      ...map(get('pid'), serverProcesses),
      ...map(get('pid'), serverHotProcesses)
    ]);

    log.exitWithError(`
  ERROR: Catalyst server failed to start!

         Other processes are currently running on port ${devServerPort} and/or ${devServerHotPort}.
         You can run 'kill -9 ${processIDs.join(' ')}' to stop them.
    `);
  }

  const directories = getDirectories();
  const router = new Router();
  const vendorFilePath = path.join(directories.temp, 'vendor-dll.js');

  router.get('/vendor-dll.js', ctx => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.body = fs.readFileSync(vendorFilePath);
  });

  console.log('Prebuilding vendor packages...\n');

  const output = execSync(
    [
      'yarn',
      'run',
      'webpack',
      `--config=${path.resolve(__dirname, '../config/webpack/dll-config.js')}`,
      '--display-error-details',
      '--hide-modules',
      '--bail',
      '--color'
    ].join(' ')
  );

  console.log(output.toString());

  const webpackConfig = require(path.join(
    directories.context,
    'config/webpack.js'
  ));

  serve({
    config: webpackConfig,
    host: devServerHost,
    port: devServerPort,
    clipboard: false,
    dev: {
      headers: { 'Access-Control-Allow-Origin': '*' },
      logLevel: 'warn'
    },
    hot: options.hot
      ? {
          port: devServerHotPort
        }
      : false,
    add(app) {
      app.use(router.routes());
    }
  });
}

module.exports = server;
