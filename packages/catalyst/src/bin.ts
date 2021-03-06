#! /usr/bin/env node

import program from 'commander';
import init from './commands/init';
import server from './commands/server';
import build from './commands/build';
import logStatus, { Status } from './utils/logStatus';

program.version(require('../package.json')['version']);

program
  .command('init')
  .option('--force', 'run command even if uncommitted files exist')
  .description('creates a new package.json and directory structure')
  .action(init);

program
  .command('server')
  .alias('s')
  .option(
    '--bundle-analyzer',
    'open a visual representation of the webpack output'
  )
  .description('starts a development server')
  .action((options) => {
    // TODO: Determine if this logic should be moved to the server function
    // itself. Or possibly convert all command functions to async functions so
    // the same `catch()` logic can be used for all of them.
    server(options).catch((error) => {
      if (error instanceof Error) {
        logStatus(Status.Error, error.stack ?? error.message);
      }

      process.exit(1);
    });
  });

program
  .command('build')
  .description('creates either a "production" or "test" build')
  .option('--watch', 'watch the filesystem for changes')
  .action((options) => {
    // TODO: Determine if this logic should be moved to the build function
    // itself. Or possibly convert all command functions to async functions so
    // the same `catch()` logic can be used for all of them.
    build(options).catch((error) => {
      if (error instanceof Error) {
        logStatus(Status.Error, error.stack ?? error.message);
      }

      process.exit(1);
    });
  });

program.parse(process.argv);
