const fs = require('fs');
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const inquirer = require('inquirer');

const { exitWithError } = require('../utils/logging');
const spinnerSpawn = require('../utils/spinner-spawn');
const writeFileFromTemplate = require('../utils/write-file-from-template');

const nodePackages = [
  '@ftw/catalyst',
  'axios',
  'bind-decorator',
  'classnames',
  'react',
  'react-dom',
  'react-redux',
  'redux',
  'redux-saga'
];
const nodePackagesDev = [
  '@ftw/eslint-config-catalyst',
  'babel-eslint',
  'eslint',
  'eslint-plugin-flowtype',
  'eslint-plugin-react',
  'flow-bin',
  'jest',
  'react-addons-perf',
  'react-test-renderer'
];

function runInSeries(funcs) {
  return funcs.reduce((promise, func) => {
    return promise.then(() => func());
  }, Promise.resolve());
}

function init() {
  if (fs.existsSync('package.json')) {
    const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (typeof packageData.catalyst === 'object') {
      exitWithError('This project already has a Catalyst configuration.');
    }
  }

  inquirer
    .prompt([
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
    ])
    .then(config => {
      mkdirp.sync(`${config.rootPath}/bundles`);
      mkdirp.sync(`${config.rootPath}/components`);
      mkdirp.sync(`${config.rootPath}/modules`);
      mkdirp.sync(`${config.rootPath}/styles`);
      mkdirp.sync(`${config.rootPath}/assets/fonts`);
      mkdirp.sync(`${config.rootPath}/assets/images`);

      runInSeries([
        writeFileFromTemplate.bind(null, 'package.json', 'package.json.jst', { config }),
        writeFileFromTemplate.bind(null, '.babelrc', '.babelrc.jst'),
        writeFileFromTemplate.bind(null, '.eslintrc', '.eslintrc.jst'),
        writeFileFromTemplate.bind(null, '.flowconfig', '.flowconfig.jst', { config }),
        writeFileFromTemplate.bind(null, 'webpack.config.js', 'webpack.config.js.jst'),

        writeFileFromTemplate.bind(
          null,
          `${config.rootPath}/bundles/application.js`,
          'bundles/application.js.jst'
        ),

        writeFileFromTemplate.bind(null, `${config.rootPath}/store.js`, 'store.js.jst'),
        writeFileFromTemplate.bind(
          null,
          `${config.rootPath}/store-provider.js`,
          'store-provider.js.jst'
        )
      ]).then(() => {
        fs.writeFileSync(`${config.rootPath}/styles/application.scss`, '');

        installPackages(nodePackages)
          .then(() => {
            return installPackages(nodePackagesDev, true);
          })
          .then(
            () => {
              console.log(chalk.green('Done'));
            },
            code => {
              console.log(chalk.red('Failed'));
              process.exit(code);
            }
          );
      });
    });
}

function installPackages(packages, development = false) {
  const saveFlag = development ? '--dev' : null;

  return spinnerSpawn(
    'yarn',
    ['add'].concat(packages).concat([saveFlag, '--color']),
    'Installing Packages...'
  );
}

module.exports = init;
