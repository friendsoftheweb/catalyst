var spawn = require('child_process').spawn;

var server = function() {
  var cmd = spawn('./node_modules/webpack-dev-server/bin/webpack-dev-server.js', ['--colors']);

  cmd.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  cmd.stderr.on('data', function (data) {
    console.log(data.toString());
  });
};

module.exports = server;
