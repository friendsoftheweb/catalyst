const path = require('path');
const environment = require('../../utils/environment');

const devServerPort = process.env.WEBPACK_PORT || 8080;

function generateOutput({ context, buildPath }) {
  const env = environment();
  const output = {};

  if (env.production) {
    output.path = buildPath;
    output.filename = '[name]-[hash].js';
  } else if (env.test) {
    output.path = buildPath;
    output.filename = '[name].js';
  } else {
    output.path = path.join(context, 'app', 'assets');
    output.filename = '[name].js';
    output.publicPath = `http://localhost:${devServerPort}/`;
  }

  return output;
}

module.exports = generateOutput;