#! /usr/bin/env node

const { templateSettings } = require('lodash');
const program = require('commander');

templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

const init = require('./commands/init');
const generate = require('./commands/generate');
const server = require('./commands/server');
const build = require('./commands/build');
const check = require('./commands/check');

program.version('0.0.1');

program
  .command('init')
  .description('creates a new package.json and directory structure')
  .action(init);

program
  .command('generate [type] [name]')
  .alias('g')
  .description('generates a new set of files based on the type')
  .action(generate);

program.command('server').alias('s').description('starts a development server').action(server);

program.command('build').description('builds it').action(build);
program.command('check').description('checks it').action(check);

program.parse(process.argv);
