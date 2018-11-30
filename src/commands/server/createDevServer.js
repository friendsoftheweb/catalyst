const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const { getDirectories } = require('../../utils');

function createDevServer({ host, port, overlay }) {
  const directories = getDirectories();
  const vendorFilePath = path.join(directories.temp, 'vendor-dll.js');

  const options = {
    host,
    port,
    hot: true,
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
  };

  const config = require(path.join(directories.context, 'config/webpack.js'));

  // If the custom error overlay is disabled, add the standard webpack
  // development client.
  if (overlay === false) {
    WebpackDevServer.addDevServerEntrypoints(config, options);
  }

  const compiler = webpack(config);

  return new WebpackDevServer(compiler, options);
}

module.exports = createDevServer;
