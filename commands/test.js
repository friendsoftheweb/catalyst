var spawn = require('child_process').spawn;

var test = function() {
  var cmd = spawn('./node_modules/jest/bin/jest.js');

  cmd.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  cmd.stderr.on('data', function (data) {
    console.log(data.toString());
  });
};

module.exports = test;
