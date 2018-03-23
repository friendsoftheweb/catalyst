const path = require('path');
const fs = require('fs');
const serve = require('webpack-serve');
const getDirectories = require('../utils/getDirectories');
const environment = require('../utils/environment');
const { execSync } = require('child_process');
const Router = require('koa-router');

const directories = getDirectories();
const router = new Router();
const vendorFilePath = path.join(directories.temp, 'vendor-dll.js');

router.get('/vendor-dll.js', ctx => {
  ctx.body = fs.readFileSync(vendorFilePath);
});

function server() {
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

  const { devServerHost, devServerPort, devServerHotPort } = environment();

  serve({
    config: webpackConfig,
    host: devServerHost,
    port: devServerPort,
    clipboard: false,
    dev: {
      headers: { 'Access-Control-Allow-Origin': '*' },
      logLevel: 'warn'
    },
    hot: {
      port: devServerHotPort
    },
    add(app) {
      app.use(router.routes());
    }
  });
}

module.exports = server;
