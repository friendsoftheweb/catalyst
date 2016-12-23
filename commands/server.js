const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

function server() {
  const config = require(path.join(process.cwd(), 'webpack.config.js'));
  const compiler = webpack(config);
  const devServerPort = process.env.WEBPACK_PORT || 8080;

  const webpackServer = new WebpackDevServer(compiler, {
    publicPath: config.output.publicPath,
    historyApiFallback: true,
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
};

module.exports = server;
