import fs from 'fs';

interface Configuration {
  rootPath: string;
  buildPath: string;
  overlay?: boolean;
  prebuildPackages?: string[];
}

const defaultConfig: Partial<Configuration> = {
  overlay: false,
  prebuildPackages: [
    '@reach/router',
    'apollo-cache-inmemory',
    'apollo-client',
    'apollo-link',
    'apollo-link-http',
    'axios',
    'catalyst-client',
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

export default function getConfig(): Configuration {
  if (fs.existsSync('package.json')) {
    const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (typeof packageData.catalyst === 'object') {
      return Object.assign({}, defaultConfig, packageData.catalyst);
    } else {
      throw new Error('package.json is missing a catalyst config');
    }
  } else {
    throw new Error('Missing package.json');
  }
}
