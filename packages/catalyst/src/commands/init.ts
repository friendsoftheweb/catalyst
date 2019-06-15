import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import inquirer from 'inquirer';

import installMissingDependencies from '../utils/installMissingDependencies';
import writeFileFromTemplate from '../utils/writeFileFromTemplate';
import exitWithError from '../utils/exitWithError';

export const defaultConfig = {
  contextPath: 'client',
  buildPath: 'public/assets',
  publicPath: '/assets'
};

const nodePackages = ['react', 'react-dom', 'core-js@3'];
const nodePackagesDev = ['typescript', '@types/react', '@types/react-dom'];

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

    Object.assign(currentConfig, catalystConfigPath);
  }

  const config = await inquirer.prompt<{
    contextPath: string;
    buildPath: string;
    publicPath: string;
  }>([
    {
      name: 'contextPath',
      message: 'Context path:',
      default: currentConfig.contextPath
    },
    {
      name: 'buildPath',
      message: 'Build path:',
      default: currentConfig.buildPath
    },
    {
      name: 'publicPath',
      message: 'Public path:',
      default: currentConfig.publicPath
    }
  ]);

  mkdirp.sync(`${config.contextPath}/bundles`);
  mkdirp.sync(`${config.contextPath}/components`);
  mkdirp.sync(`${config.contextPath}/modules`);
  mkdirp.sync(`${config.contextPath}/config`);
  mkdirp.sync(`${config.contextPath}/styles`);
  mkdirp.sync(`${config.contextPath}/assets/fonts`);
  mkdirp.sync(`${config.contextPath}/assets/images`);

  await writeFileFromTemplate(
    'catalyst.config.json',
    'catalyst.config.json.jst',
    config
  );

  await writeFileFromTemplate('.babelrc', 'babelrc.jst');
  await writeFileFromTemplate('.eslintrc', 'eslintrc.jst');
  await writeFileFromTemplate('tsconfig.json', 'tsconfig.json.jst', config);

  if (firstRun) {
    await writeFileFromTemplate(
      `${config.contextPath}/bundles/application/index.ts`,
      'bundle.ts.jst'
    );

    fs.writeFileSync(`${config.contextPath}/styles/application.scss`, '');
  }

  await installMissingDependencies(nodePackages);
  await installMissingDependencies(nodePackagesDev, true);

  console.log(chalk.green('\nDone'));
}

function modifiedFileCount(): number {
  return parseInt(
    execSync(
      'git status --porcelain --untracked-files=no -- | wc -l | tr -d " "',
      {
        stdio: ['pipe', 'pipe', 'ignore']
      }
    ).toString()
  );
}
