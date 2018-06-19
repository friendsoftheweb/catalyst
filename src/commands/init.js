const fs = require('fs');
const { execSync } = require('child_process');
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { get, without } = require('lodash');

const { log, spinnerSpawn, writeFileFromTemplate } = require('../utils');

const nodePackages = [
  'catalyst',
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
  'react-test-renderer'
];

function runInSeries(funcs) {
  return funcs.reduce((promise, func) => {
    return promise.then(() => func());
  }, Promise.resolve());
}

function modifiedFileCount() {
  return parseInt(
    execSync(
      'git status --porcelain --untracked-files=no -- | wc -l | tr -d " "',
      {
        stdio: ['pipe', 'pipe', 'ignore']
      }
    ).toString()
  );
}

function init(options) {
  const defaultConfig = { rootPath: 'client', buildPath: 'public/assets' };

  if (!options.force && modifiedFileCount() > 0) {
    log.exitWithError(
      'Please commit or stash any modified files before running `catalyst init` or rerun as `catalyst init --force`.'
    );
  }

  let packageData = null;
  let firstRun = true;

  if (fs.existsSync('package.json')) {
    packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (typeof packageData.catalyst === 'object') {
      firstRun = false;

      Object.assign(defaultConfig, packageData.catalyst);
    }
  }

  inquirer
    .prompt([
      {
        name: 'rootPath',
        message: 'Root path:',
        default: defaultConfig.rootPath
      },
      {
        name: 'buildPath',
        message: 'Build path:',
        default: defaultConfig.buildPath
      }
    ])
    .then(config => {
      mkdirp.sync(`${config.rootPath}/bundles`);
      mkdirp.sync(`${config.rootPath}/components`);
      mkdirp.sync(`${config.rootPath}/modules`);
      mkdirp.sync(`${config.rootPath}/config`);
      mkdirp.sync(`${config.rootPath}/styles`);
      mkdirp.sync(`${config.rootPath}/assets/fonts`);
      mkdirp.sync(`${config.rootPath}/assets/images`);

      const commands = [];

      if (firstRun) {
        commands.push(
          writeFileFromTemplate.bind(null, 'package.json', 'package.json.jst', {
            config
          })
        );
      }

      commands.push(
        writeFileFromTemplate.bind(null, '.babelrc', '.babelrc.jst'),
        writeFileFromTemplate.bind(null, '.eslintrc', '.eslintrc.jst'),
        writeFileFromTemplate.bind(null, '.flowconfig', '.flowconfig.jst', {
          config
        }),
        writeFileFromTemplate.bind(
          null,
          `${config.rootPath}/config/webpack.js`,
          'webpack.config.js.jst'
        )
      );

      if (firstRun) {
        commands.push(
          writeFileFromTemplate.bind(
            null,
            `${config.rootPath}/bundles/application/index.js`,
            'bundles/bundle.js.jst'
          ),
          writeFileFromTemplate.bind(
            null,
            `${config.rootPath}/bundles/application/store.js`,
            'bundles/store.js.jst'
          ),
          writeFileFromTemplate.bind(
            null,
            `${config.rootPath}/bundles/application/store-provider.js`,
            'bundles/store-provider.js.jst'
          )
        );
      }

      runInSeries(commands).then(() => {
        if (firstRun) {
          fs.writeFileSync(`${config.rootPath}/styles/application.scss`, '');
        }

        const installedPackages = Object.keys(
          get(packageData, 'dependencies', {})
        );

        const installedPackagesDev = Object.keys(
          get(packageData, 'devDependencies', {})
        );

        installPackages(without(nodePackages, ...installedPackages))
          .then(() => {
            return installPackages(
              without(nodePackagesDev, ...installedPackagesDev),
              true
            );
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
  if (packages.length === 0) {
    return Promise.resolve();
  }

  const saveFlag = development ? '--dev' : null;

  return spinnerSpawn(
    'yarn',
    ['add'].concat(packages).concat([saveFlag, '--color']),
    'Installing Packages...'
  );
}

module.exports = init;
