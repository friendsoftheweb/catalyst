#! /usr/bin/env node

var _ = require('lodash');
var argv = require('electron').argv();

_.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

var init = require('./commands/init');
var generate = require('./commands/generate');
var server = require('./commands/server');
var build = require('./commands/build');
var test = require('./commands/test');
var check = require('./commands/check');

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
