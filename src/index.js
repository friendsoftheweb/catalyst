#! /usr/bin/env node

module.exports = {
  webpackConfig: require('./config/webpack')
};

const { templateSettings } = require('lodash');
const program = require('commander');

templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

const init = require('./commands/init');
const generate = require('./commands/generate');
const server = require('./commands/server');
const build = require('./commands/build');

program.version(require('../package.json')['version']);

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
  .option(
    '--no-hot',
    'instruct the client not to apply Hot Module Replacement patches'
  )
  .description('starts a development server')
  .action(server);

program
  .command('build')
  .description('builds it')
  .action(build);

program.parse(process.argv);
