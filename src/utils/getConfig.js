const fs = require('fs');
const { exitWithError } = require('./log');

const defaultConfig = {
  overlay: false,
  prebuildPackages: [
    '@reach/router',
    'apollo-cache-inmemory',
    'apollo-client',
    'apollo-link',
    'apollo-link-http',
    'axios',
    'catalyst/lib/dev-client',
    'classnames',
    'lodash',
    'react',
    'react-apollo',
    'react-dom',
    'react-router',
    'react-router-dom',
    'react-redux',
    'redux',
    'redux-logger',
    'redux-saga',
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
