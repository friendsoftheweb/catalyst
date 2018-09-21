const { execSync } = require('child_process');
const { exitWithError } = require('./log');

async function rebuildNodeSASS() {
  try {
    execSync('yarn run node-sass -v > /dev/null 2>&1');
  } catch (error) {
    console.log('\nAttempting to rebuild node-sass...');

    try {
      execSync('npm rebuild node-sass');
    } catch (error) {
      console.error(error.stack);

      exitWithError('Failed to rebuild node-sass.');
    }
  }
}

module.exports = rebuildNodeSASS;
