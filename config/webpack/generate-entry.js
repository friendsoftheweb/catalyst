const path = require('path');
const environment = require('../../utils/environment');
const resolveModulePath = require('../../utils/resolve-module-path');

function generateEntry(entryPath) {
  const env = environment();
  const entry = [];

  if (env.development) {
    entry.push(path.resolve(__dirname, '../../webpack-dev-client'));
  }

  entry.push(
    resolveModulePath('es5-shim'),
    resolveModulePath('es6-promise/auto'),
    resolveModulePath('regenerator-runtime/runtime'),
    path.resolve(__dirname, '../../vendor/react-ujs')
  );

  entry.push(entryPath);

  return entry;
}

module.exports = generateEntry;
