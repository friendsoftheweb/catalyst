#! /usr/bin/env node

const _ = require('lodash');
const argv = require('electron').argv();

_.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

const init = require('./commands/init');
const generate = require('./commands/generate');
const server = require('./commands/server');
const build = require('./commands/build');
const test = require('./commands/test');
const check = require('./commands/check');

switch(argv.commands[0]) {
  case 'init':
    init(argv.params);
    break;
  case 'generate':
  case 'g':
    generate(argv.commands[1], argv.commands[2], argv.params);
    break;
  case 'server':
  case 's':
    server();
    break;
  case 'build':
    build();
    break;
  case 'test':
    test();
    break;
  case 'check':
    check();
    break;
};
