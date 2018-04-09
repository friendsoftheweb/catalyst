const fs = require('fs');
const { exitWithError } = require('./log');

const defaultConfig = {
  prebuildPackages: [
    'axios',
    'bind-decorator',
    'classnames',
    'lodash',
    'react',
    'react-dom',
    'redux',
    'redux-logger',
    'redux-saga',
    'react-router',
    'react-router-dom',
    'react-redux',
    'regenerator-runtime'
  ]
};

function getConfig() {
  if (fs.existsSync('package.json')) {
    const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (typeof packageData.catalyst === 'object') {
      return Object.assign({}, defaultConfig, packageData.catalyst);
    } else {
      exitWithError('package.json is missing a catalyst config');
    }
  } else {
    exitWithError('Missing package.json');
  }
}

module.exports = getConfig;
