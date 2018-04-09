#! /usr/bin/env node

const { templateSettings } = require('lodash');
const program = require('commander');

templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

const init = require('./src/commands/init');
const generate = require('./src/commands/generate');
const server = require('./src/commands/server');
const build = require('./src/commands/build');

program.version(require('./package.json')['version']);

program
  .command('init')
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
  .description('starts a development server')
  .action(server);

program
  .command('build')
  .description('builds it')
  .action(build);

program.parse(process.argv);
