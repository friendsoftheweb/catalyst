var RSVP = require('rsvp');
var Spinner = require('node-spinner');
var spawn = require('child_process').spawn;

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

module.exports = spinnerSpawn;
