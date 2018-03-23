const path = require('path');
const serve = require('webpack-serve');
const loadConfig = require('../utils/load-config');
const environment = require('../utils/environment');
const { execSync } = require('child_process');

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
      headers: { 'Access-Control-Allow-Origin': '*' }
    },
    hot: {
      port: devServerHotPort
    }
  });
}

module.exports = server;
