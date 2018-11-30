const { execSync } = require('child_process');
const { exitWithError } = require('./log');

async function rebuildNodeSASS() {
  try {
    execSync('yarn run node-sass -v > /dev/null 2>&1');
  } catch (error) {
    console.log('\nAttempting to rebuild node-sass...');

    try {
      execSync('npm rebuild node-sass', { stdio: 'inherit' });
    } catch (error) {
      exitWithError(`Failed to rebuild node-sass:\n\n${error.stack}`);
    }
  }
}

module.exports = rebuildNodeSASS;
