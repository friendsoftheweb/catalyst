const RSVP = require('rsvp');
const Spinner = require('node-spinner');
const { spawn } = require('child_process');

function spinnerSpawn(command, args, message) {
  return new RSVP.Promise((resolve, reject) => {
    const spinner = Spinner();

    const spinnerInterval = setInterval(function(){
      process.stdout.write('\r \033[36m' + message + '\033[m ' + spinner.next());
    }, 100);

    const cmd = spawn(command, args);

    cmd.stdout.on('data', function (data) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);

      console.log(data.toString());
    });

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
