const path = require('path');
const environment = require('../../utils/environment');
const resolveModulePath = require('../../utils/resolve-module-path');

const devServerPort = process.env.WEBPACK_PORT || 8080;

function generateEntry(entryPath) {
  const env = environment();
  const entry = [];

  if (env.development) {
    entry.push(
      `${resolveModulePath('webpack-dev-server/client')}?http://localhost:${devServerPort}`
    );
  }

  entry.push(
    resolveModulePath('es5-shim'),
    resolveModulePath('es6-promise/auto'),
    path.resolve(__dirname, '../../vendor/react-ujs')
  );
  entry.push(entryPath);

  return entry;
}

module.exports = generateEntry;
