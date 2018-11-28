const findProcess = require('find-process');
const { get, map, flatten, uniq } = require('lodash/fp');

const log = require('./log');

async function checkPortAvailability(...ports) {
  const processes = await Promise.all(
    ports.map(port => findProcess('port', port))
  );

  const processIDs = uniq(map(get('pid'), flatten(processes)));

  if (processIDs.length > 0) {
    log.exitWithError(`
  ERROR: Catalyst server failed to start!

         Other processes are currently running on port(s): ${ports.join(', ')}.
         You can run 'kill -9 ${processIDs.join(' ')}' to stop them.
    `);
  }
}

module.exports = checkPortAvailability;
