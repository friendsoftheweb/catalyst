const path = require('path');
const fs = require('fs');
const serve = require('webpack-serve');
const loadConfig = require('../utils/load-config');
const environment = require('../utils/environment');
const { execSync } = require('child_process');
const Router = require('koa-router');
const projectRoot = process.cwd();

const router = new Router();
const vendorFilePath = path.join(projectRoot, 'tmp/catalyst/vendor-dll.js');

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

  const config = loadConfig();

  const webpackConfig = require(path.join(
    process.cwd(),
    config.rootPath,
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
