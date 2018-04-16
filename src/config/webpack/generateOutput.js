const path = require('path');
const { getEnvironment } = require('../../utils');

function generateOutput({ context, buildPath }) {
  const environment = getEnvironment();
  const output = {};

  if (environment.production) {
    output.path = buildPath;
    output.filename = '[name]-[hash].js';
  } else if (environment.test) {
    output.path = buildPath;
    output.filename = '[name].js';
  } else {
    output.path = path.join(context, 'app', 'assets');
    output.filename = '[name].js';
    output.publicPath = `http://${environment.devServerHost}:${
      environment.devServerPort
    }/`;
  }

  return output;
}

module.exports = generateOutput;
