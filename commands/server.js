const path = require('path');
const serve = require('webpack-serve');
const loadConfig = require('../utils/load-config');
const environment = require('../utils/environment');

function server() {
  const config = loadConfig();

  const webpackConfig = require(path.join(
    process.cwd(),
    config.rootPath,
    'config/webpack.js'
  ));

  const { devServerHost, devServerPort } = environment();

  serve({
    config: webpackConfig,
    host: devServerHost,
    port: devServerPort,
    clipboard: false,
    dev: {
      headers: { 'Access-Control-Allow-Origin': '*' }
    }
  });
}

module.exports = server;
