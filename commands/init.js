var mkdirp = require('mkdirp');
var chalk = require('chalk');

var spinnerSpawn = require('../utils/spinner-spawn');
var writeFileFromTemplate = require('../utils/write-file-from-template');

var init = function(options) {
  const nodePackages = [
    'babel-loader',
    'css-loader',
    'file-loader',
    'jsx-loader',
    'eslint',
    'karma',
    'karma-chrome-launcher',
    'karma-cli',
    'karma-mocha',
    'karma-osx-reporter',
    'karma-phantomjs-launcher',
    'karma-webpack',
    'expect.js',
    'node-sass',
    'nuclear-js',
    'react',
    'react-hot-loader',
    'sass-loader',
    'style-loader',
    'extract-text-webpack-plugin',
    'webpack',
    'webpack-dev-server'
  ];

  mkdirp.sync('bundles');
  mkdirp.sync('app/components');
  mkdirp.sync('app/modules');
  mkdirp.sync('app/records');
  mkdirp.sync('assets/fonts');
  mkdirp.sync('assets/images');

  writeFileFromTemplate('package.json', 'package.json.jst');
  writeFileFromTemplate('.eslintrc', '.eslintrc.jst');
  writeFileFromTemplate('webpack.config.js', 'webpack.config.js.jst');
  writeFileFromTemplate('karma.conf.js', 'karma.conf.js.jst');

  writeFileFromTemplate('server.js', 'server.js.jst');
  writeFileFromTemplate('bundles/application.js', 'bundles/application.js.jst');
  // writeFileFromTemplate('reactor.js', 'reactor.js.jst');

  spinnerSpawn(
    'npm',
    ['install', '--save-dev'].concat(nodePackages),
    'Installing Packages'
  ).then(function(code) {
    console.log(chalk.green('Done'));
  }, function(code) {
    console.log(chalk.red('Failed'));
    process.exit(code);
  });
};

module.exports = init;
