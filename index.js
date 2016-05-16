#! /usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var mkdirp = require('mkdirp');
var _ = require('lodash');
var chalk = require('chalk');
var RSVP = require('rsvp');

var Spinner = require('node-spinner');

var argv = require('electron').argv();

var logCreate = function(filePath) {
  console.log(chalk.green('  create ') + filePath);
};

var spinnerSpawn = function(command, args, message) {
  return new RSVP.Promise(function(resolve, reject) {
    var spinner = Spinner();

    var spinnerInterval = setInterval(function(){
      process.stdout.write('\r \033[36m' + message + '\033[m ' + spinner.next());
    }, 100);

    var cmd = spawn(command, args);

    cmd.stderr.on('data', function (data) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);

      console.log(data.toString());
    });

    cmd.on('close', function (code) {
      clearInterval(spinnerInterval);

      process.stdout.clearLine();
      process.stdout.cursorTo(0);

      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });
};

var classify = function(string) {
  return _.capitalize(_.camelCase(string));
};

var dasherize = function(string) {
  return _.snakeCase(string).replace(/_/g, '-');
};

var templateFromFile = function(filePath) {
  return _.template(fs.readFileSync(__dirname + '/templates/' + filePath, 'utf8'));
};

var writeFileFromTemplate = function(outputPath, templatePath, context) {
  context || (context = {});

  var outputDirname = path.dirname(outputPath);

  if (outputDirname !== '.') {
    mkdirp.sync(outputDirname);
  }

  fs.writeFileSync(outputPath, templateFromFile(templatePath)(context));

  logCreate(outputPath);
};

var init = function(options) {
  var nodePackages = [
    'babel-loader',
    'css-loader',
    'file-loader',
    'jsx-loader',
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

  mkdirp.sync('components');
  mkdirp.sync('modules');

  writeFileFromTemplate('package.json', 'package.json.jst');
  writeFileFromTemplate('bower.json', 'bower.json.jst');
  writeFileFromTemplate('.eslintrc', '.eslintrc.jst');
  writeFileFromTemplate('webpack.config.js', 'webpack.config.js.jst');
  writeFileFromTemplate('karma.conf.js', 'karma.conf.js.jst');

  writeFileFromTemplate('main.js', 'main.js.jst');
  writeFileFromTemplate('reactor.js', 'reactor.js.jst');

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

var generateComponent = function(className, options) {
  var context = {
    className: className
  };

  var filePathBase = 'components/' + dasherize(className) + '/';

  writeFileFromTemplate(filePathBase + 'component.js', 'component.js.jst', context);
  writeFileFromTemplate(filePathBase + 'styles.scss', 'styles.scss.jst', context);
  writeFileFromTemplate(filePathBase + 'component-tests.js', 'component-tests.js.jst', context);
};

var generateModule = function(moduleName, options) {
  var context = {
    moduleName: moduleName
  };

  var filePathBase = 'modules/' + dasherize(moduleName) + '/';

  mkdirp.sync(filePathBase + 'stores');

  writeFileFromTemplate(filePathBase + 'main.js', 'module/main.js.jst', context);
  writeFileFromTemplate(filePathBase + 'action-types.js', 'module/action-types.js.jst', context);
  writeFileFromTemplate(filePathBase + 'actions.js', 'module/actions.js.jst', context);
  writeFileFromTemplate(filePathBase + 'getters.js', 'module/getters.js.jst', context);
  writeFileFromTemplate(filePathBase + 'module-tests.js', 'module/module-tests.js.jst', context);
};

var generate = function(type, className, options) {
  var parts = className.split(/[\.\/]/);

  className = classify(parts[parts.length - 1]);

  switch(type) {
    case 'component':
      generateComponent(className, options);
      break;
    case 'module':
      generateModule(className, options);
      break;
  }
};

var server = function() {
  var cmd = spawn('./node_modules/webpack-dev-server/bin/webpack-dev-server.js', ['--colors']);

  cmd.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  cmd.stderr.on('data', function (data) {
    console.log(data.toString());
  });
};

var build = function() {
  spinnerSpawn('./node_modules/webpack/bin/webpack.js', [
    '-d', '--display-reasons', '--display-chunks', '--bail'
  ], 'Building')
    .then(function(code) {
      console.log(chalk.green('Build Succeeded'));
    }, function(code) {
      console.log(chalk.red('Build Failed'));
      process.exit(code);
    });
};

var test = function() {
  var cmd = spawn('./node_modules/karma/bin/karma', ['start']);

  cmd.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  cmd.stderr.on('data', function (data) {
    console.log(data.toString());
  });
};

var check = function() {
  var cmd = spawn(__dirname + '/node_modules/eslint/bin/eslint.js', [
    './components/**/component.js'
  ]);

  cmd.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  cmd.stderr.on('data', function (data) {
    console.log(data.toString());
  });

  cmd.on('close', function (code) {
    if (code === 0) {
      console.log(chalk.green('Passed'));
    } else {
      console.log(chalk.red('Failed'));
    }
  });
}

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
