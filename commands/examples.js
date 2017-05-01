const path = require('path');
const http = require('http');
const express = require('express');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const environment = require('../utils/environment');
const generateEntry = require('../config/webpack/generate-entry');
const app = express();

app.set('port', 4000);
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, './examples/views'));

app.get('/render', (req, res) => {
  res.render('render');
});

app.get('/:exampleName', (req, res) => {
  const { exampleName } = req.params;

  res.render('index', { exampleName });
});

function examples() {
  const context = process.cwd();

  const config = Object.assign(
    {},
    require(path.join(process.cwd(), 'webpack.config.js')),
    {
      entry: {
        examples: generateEntry(
          path.resolve(context, './client/examples.js')
        ).concat(path.resolve(__dirname, '../config/webpack/entry/examples.js'))
      }
    }
  );

  const compiler = webpack(config);
  const { devServerPort } = environment();
  const expressServer = http.createServer(app);

  expressServer.listen(app.get('port'), () => {
    console.log('Web server listening on port ' + app.get('port'));
  });

  const webpackServer = new WebpackDevServer(compiler, {
    publicPath: config.output.publicPath,
    historyApiFallback: true,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    stats: {
      colors: true,
      hash: false,
      version: false,
      chunks: false,
      children: false
    }
  });

  webpackServer.listen(devServerPort, '0.0.0.0', err => {
    if (err) {
      console.log(err);
    }
  });
}

module.exports = examples;
