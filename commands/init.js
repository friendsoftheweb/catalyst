const fs = require('fs');
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const inquirer = require('inquirer');

const { exitWithError } = require('../utils/logging');
const spinnerSpawn = require('../utils/spinner-spawn');
const writeFileFromTemplate = require('../utils/write-file-from-template');

const nodePackages = [
  'autoprefixer',
  'axios',
  'babel-core',
  'babel-loader',
  'babel-jest',
  'babel-preset-es2015',
  'babel-preset-react',
  'babel-preset-stage-2',
  'css-loader',
  'es5-shim',
  'es6-promise',
  'expose-loader',
  'extract-text-webpack-plugin',
  'file-loader',
  'immutable',
  'jsx-loader',
  'node-sass',
  'postcss-loader',
  'react',
  'react-dom',
  'react-redux',
  'redux',
  'redux-saga',
  'sass-loader',
  'style-loader',
  'webpack',
  'webpack-manifest-plugin'
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
      exitWithError('This project already has a Catalyst configuration.');
    }
  }

  inquirer.prompt([
    {
      name: 'rootPath',
      message: 'Root path:',
      default: 'client'
    },
    {
      name: 'buildPath',
      message: 'Build path:',
      default: 'public/assets'
    }
  ]).then((config) => {
    mkdirp.sync(`${config.rootPath}/bundles`);
    mkdirp.sync(`${config.rootPath}/components`);
    mkdirp.sync(`${config.rootPath}/modules`);
    mkdirp.sync(`${config.rootPath}/records`);
    mkdirp.sync(`${config.rootPath}/styles`);
    mkdirp.sync(`${config.rootPath}/assets/fonts`);
    mkdirp.sync(`${config.rootPath}/assets/images`);

    writeFileFromTemplate('package.json', 'package.json.jst', { config });
    writeFileFromTemplate('.babelrc', '.babelrc.jst');
    writeFileFromTemplate('.eslintrc', '.eslintrc.jst');
    writeFileFromTemplate('webpack.config.js', 'webpack.config.js.jst');

    writeFileFromTemplate(`${config.rootPath}/bundles/application.js`, 'bundles/application.js.jst');

    writeFileFromTemplate(`${config.rootPath}/store.js`, 'store.js.jst');
    writeFileFromTemplate(`${config.rootPath}/provider.js`, 'provider.js.jst');

    fs.writeFileSync(`${config.rootPath}/styles/application.scss`, '');

    installPackages(nodePackages).then(() => {
      return installPackages(nodePackagesDev, true);
    }).then((code) => {
      console.log(chalk.green('Done'));
    }, (code) => {
      console.log(chalk.red('Failed'));
      process.exit(code);
    });
  });
};

function installPackages(packages, development = false) {
  const saveFlag = development ? '--dev' : null;

  return spinnerSpawn(
    'yarn',
    ['add', saveFlag].concat(packages),
    'Installing Packages...'
  );
}

module.exports = init;
