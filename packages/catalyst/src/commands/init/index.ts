import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { templateSettings } from 'lodash';

import installMissingDependencies from '../../utils/installMissingDependencies';
import writeFileFromTemplate from '../../utils/writeFileFromTemplate';
import exitWithError from '../../utils/exitWithError';
import tryWriteFile from '../../utils/tryWriteFile';
import forEachPlugin from '../../utils/forEachPlugin';
import Configuration from '../../Configuration';

templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

export const defaultConfig = {
  contextPath: 'client',
  buildPath: 'public/assets',
  publicPath: '/assets/',
  plugins: [],
};

const defaultNodePackages = ['react', 'react-dom', 'core-js@3'];

const defaultNodePackagesDev = [
  'typescript',
  '@types/react',
  '@types/react-dom',
  'eslint',
  '@ftw/eslint-config-ts',
];

interface Options {
  force: boolean;
}

export default async function init(options: Options) {
  if (!options.force && modifiedFileCount() > 0) {
    exitWithError(
      'Please commit or stash any modified files before running `catalyst init` or rerun as `catalyst init --force`.'
    );
  }

  let firstRun = true;
  const currentConfig = Object.assign({}, defaultConfig);
  const catalystConfigPath = path.join(process.cwd(), 'catalyst.config.json');

  if (fs.existsSync(catalystConfigPath)) {
    firstRun = false;

    Object.assign(currentConfig, require(catalystConfigPath));
  }

  const config = await inquirer.prompt<{
    contextPath: string;
    buildPath: string;
    publicPath: string;
    plugins: Array<
      'catalyst-plugin-graphql-tag' | 'catalyst-plugin-styled-components'
    >;
  }>([
    {
      name: 'contextPath',
      message: 'Context path:',
      default: currentConfig.contextPath,
    },
    {
      name: 'buildPath',
      message: 'Build path:',
      default: currentConfig.buildPath,
    },
    {
      name: 'publicPath',
      message: 'Public path:',
      default: currentConfig.publicPath,
    },
    {
      name: 'plugins',
      type: 'checkbox',
      message: 'Select plugins:',
      choices: [
        'catalyst-plugin-graphql-tag',
        'catalyst-plugin-styled-components',
      ],
      default: currentConfig.plugins || [],
    },
  ]);

  mkdirp.sync(`${config.contextPath}/bundles`);
  mkdirp.sync(`${config.contextPath}/components`);
  mkdirp.sync(`${config.contextPath}/modules`);
  mkdirp.sync(`${config.contextPath}/config`);
  mkdirp.sync(`${config.contextPath}/styles`);
  mkdirp.sync(`${config.contextPath}/assets/fonts`);
  mkdirp.sync(`${config.contextPath}/assets/images`);

  await tryWriteFile(
    'catalyst.config.json',
    JSON.stringify(config, null, 2) + '\n'
  );

  await writeFileFromTemplate('.babelrc', 'babelrc.jst');
  await writeFileFromTemplate('.eslintrc', 'eslintrc.jst');
  await writeFileFromTemplate('tsconfig.json', 'tsconfig.json.jst', config);
  await writeFileFromTemplate('jest.config.js', 'jest.config.js.jst', config);

  await writeFileFromTemplate(
    path.join(config.contextPath, 'assets.d.ts'),
    'assets.d.ts.jst'
  );

  if (firstRun) {
    await writeFileFromTemplate(
      path.join(config.contextPath, 'bundles/application/index.ts'),
      'bundle.ts.jst'
    );

    const stylesheetPath = path.join(
      config.contextPath,
      'styles/application.scss'
    );

    if (!fs.existsSync(stylesheetPath)) {
      fs.writeFileSync(stylesheetPath, '');
    }
  }

  let nodePackages = [...defaultNodePackages, ...config.plugins];
  let nodePackagesDev = [...defaultNodePackagesDev];

  // TODO: Make sure this works properly before merging!!!!!!!!!!!!!!!!!!!!!!!
  forEachPlugin(new Configuration(config), (plugin) => {
    if (plugin.modifyNodePackages != null) {
      nodePackages = plugin.modifyNodePackages(nodePackages);
    }

    if (plugin.modifyNodePackagesDev != null) {
      nodePackagesDev = plugin.modifyNodePackagesDev(nodePackagesDev);
    }
  });

  await installMissingDependencies(nodePackages);
  await installMissingDependencies(nodePackagesDev, true);

  console.log(chalk.green('\nDone'));
}

function modifiedFileCount(): number {
  return parseInt(
    execSync(
      'git status --porcelain --untracked-files=no -- | wc -l | tr -d " "',
      {
        stdio: ['pipe', 'pipe', 'ignore'],
      }
    ).toString()
  );
}
