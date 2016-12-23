const fs = require('fs');
const mkdirp = require('mkdirp');
const chalk = require('chalk');

const spinnerSpawn = require('../utils/spinner-spawn');
const writeFileFromTemplate = require('../utils/write-file-from-template');

const nodePackages = [
  'babel-loader',
  'babel-jest',
  'babel-polyfill',
  'babel-preset-es2015',
  'babel-preset-react',
  'css-loader',
  'es5-shim',
  'es6-promise',
  'expose-loader',
  'extract-text-webpack-plugin',
  'file-loader',
  'isomorphic-fetch',
  'jsx-loader',
  'node-sass',
  'react',
  'react-dom',
  'sass-loader',
  'style-loader',
  'webpack'
];

const nodePackagesDev = [
  'eslint',
  'jest',
  'react-addons-perf',
  'react-test-renderer',
  'webpack-dev-server'
];

function init(options) {
  if (fs.existsSync('package.json')) {
    const package = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (typeof package.catalyst === 'object') {
      console.log('This project already has a Catalyst configuration.');
      process.exit(0);
    }
  } else {
    writeFileFromTemplate('package.json', 'package.json.jst');
  }

  mkdirp.sync('bundles');
  mkdirp.sync('app/components');
  mkdirp.sync('app/modules');
  mkdirp.sync('app/records');
  mkdirp.sync('assets/fonts');
  mkdirp.sync('assets/images');

  writeFileFromTemplate('.babelrc', '.babelrc.jst');
  writeFileFromTemplate('.eslintrc', '.eslintrc.jst');
  writeFileFromTemplate('webpack.config.js', 'webpack.config.js.jst');

  writeFileFromTemplate('bundles/application.js', 'bundles/application.js.jst');

  installPackages(nodePackages).then(() => {
    return installPackages(nodePackagesDev, true);
  }).then((code) => {
    console.log(chalk.green('Done'));
  }, (code) => {
    console.log(chalk.red('Failed'));
    process.exit(code);
  });
};

function installPackages(packages, development = false) {
  const saveFlag = development ? '--save-dev' : '--save';

  return spinnerSpawn(
    'npm',
    ['install', saveFlag].concat(packages),
    'Installing Packages...'
  );
}

module.exports = init;
