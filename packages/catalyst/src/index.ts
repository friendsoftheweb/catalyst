#! /usr/bin/env node

import { templateSettings } from 'lodash';
import program from 'commander';
import init from './commands/init';
import generate from './commands/generate/component';
import server from './commands/server';
import build from './commands/build';

templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

program.version(require('../package.json')['version']);

program
  .command('init')
  .option('--force', 'run command even if uncommitted files exist')
  .description('creates a new package.json and directory structure')
  .action(init);

program
  .command('generate [type] [name]')
  .alias('g')
  .description('generates a new set of files based on the type')
  .action(generate);

program
  .command('server')
  .alias('s')
  .option(
    '--no-hot',
    'instruct the client not to apply Hot Module Replacement patches'
  )
  .description('starts a development server')
  .action(() => {
    // TODO: Determine if this logic should be moved to the server function
    // itself. Or possibly convert all command functions to async functions so
    // the same `catch()` logic can be used for all of them.
    server().catch((error) => {
      console.error(error.stack);
      process.exit(1);
    });
  });

program
  .command('build')
  .description('builds it')
  .action(() => {
    // TODO: Determine if this logic should be moved to the build function
    // itself. Or possibly convert all command functions to async functions so
    // the same `catch()` logic can be used for all of them.
    build().catch((error) => {
      console.error(error.stack);
      process.exit(1);
    });
  });

program.parse(process.argv);
