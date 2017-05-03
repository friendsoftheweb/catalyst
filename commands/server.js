const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const loadConfig = require('../utils/load-config');
const environment = require('../utils/environment');

function server() {
  const config = loadConfig();

  const webpackConfig = require(path.join(process.cwd(), config.rootPath, 'config/webpack.js'));
  const compiler = webpack(webpackConfig);
  const { devServerPort } = environment();

  const webpackServer = new WebpackDevServer(compiler, {
    publicPath: webpackConfig.output.publicPath,
    historyApiFallback: true,
    hot: true,
    disableHostCheck: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    stats: {
      colors: true,
      hash: false,
      version: false,
      chunks: false,
      children: false
    }
  });

  webpackServer.listen(devServerPort, '0.0.0.0', function(err) {
    if (err) {
      console.log(err);
    }

    console.log(`Listening at localhost:${devServerPort}`);
  });
}

module.exports = server;
