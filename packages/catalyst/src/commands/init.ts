import fs from 'fs';
import { execSync } from 'child_process';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { get, without } from 'lodash';

import {
  exitWithError,
  runInSeries,
  spinnerSpawn,
  writeFileFromTemplate
} from '../utils';

const nodePackages = ['catalyst', 'react', 'react-dom'];

const nodePackagesDev = [
  'typescript',
  '@types/react',
  '@types/react-dom',
  '@ftw/eslint-config-catalyst',
  'babel-eslint',
  'eslint',
  'eslint-plugin-flowtype',
  'eslint-plugin-react',
  'jest',
  'react-test-renderer'
];

interface Options {
  force: boolean;
}

export default function init(options: Options) {
  const defaultConfig = { rootPath: 'client', buildPath: 'public/assets' };

  if (!options.force && modifiedFileCount() > 0) {
    exitWithError(
      'Please commit or stash any modified files before running `catalyst init` or rerun as `catalyst init --force`.'
    );
  }

  let packageData: {
    catalyst?: {};
  } = {};

  let firstRun = true;

  if (fs.existsSync('package.json')) {
    packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (typeof packageData.catalyst === 'object') {
      firstRun = false;

      Object.assign(defaultConfig, packageData.catalyst);
    }
  }

  inquirer
    .prompt<{ rootPath: string; buildPath: string }>([
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
    .then((config) => {
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
        writeFileFromTemplate.bind(null, '.babelrc', 'babelrc.jst'),
        writeFileFromTemplate.bind(null, '.eslintrc', 'eslintrc.jst'),
        writeFileFromTemplate.bind(null, 'tsconfig.json', 'tsconfig.json.jst', {
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
            `${config.rootPath}/bundles/application/index.ts`,
            'bundle.ts.jst'
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
            (code) => {
              console.log(chalk.red('Failed'));
              process.exit(code);
            }
          );
      });
    });
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

function installPackages(
  packages: string[],
  development = false
): Promise<number | void> {
  if (packages.length === 0) {
    return Promise.resolve();
  }

  const saveFlag = development ? '--dev' : '';

  return spinnerSpawn(
    'yarn',
    ['add'].concat(packages).concat([saveFlag, '--color']),
    'Installing Packages...'
  );
}
