const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const { join } = require('path');

module.exports = async function() {
  console.log('\n\nBuilding catalyst...\n');

  execSync('yarn build', { stdio: 'inherit' });

  console.log('\nInstalling catalyst into test project...\n');

  execSync('yarn add "file:../" --prefer-offline', {
    stdio: 'inherit',
    cwd: join(process.cwd(), 'test-project')
  });

  console.log('\nRemoving previous test output...\n');

  execSync('rm -rf dist', {
    stdio: 'inherit',
    cwd: join(process.cwd(), 'test-project')
  });

  execSync('NODE_ENV=test yarn run catalyst build', {
    stdio: 'inherit',
    cwd: join(process.cwd(), 'test-project')
  });
};
