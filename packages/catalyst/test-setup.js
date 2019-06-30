const { execSync } = require('child_process');
const {
  existsSync,
  statSync,
  utimesSync,
  writeFileSync,
  readFileSync
} = require('fs');
const { join } = require('path');
const glob = require('glob');

const testProjectRoot = join(process.cwd(), 'test-project');
const lastBuildTimePath = join(testProjectRoot, '.last-build');

function shouldBuild() {
  if (!existsSync(lastBuildTimePath)) {
    return true;
  }

  const lastBuildTime = statSync(lastBuildTimePath).mtime;

  if (statSync(join(testProjectRoot, 'yarn.lock')).mtime > lastBuildTime) {
    return true;
  }

  for (const filePath of glob.sync('src/**/*.*')) {
    if (statSync(filePath).mtime > lastBuildTime) {
      return true;
    }
  }

  return false;
}

module.exports = async function() {
  if (shouldBuild()) {
    console.log('\n\nBuilding catalyst...\n');

    const lastBuildTime = new Date();

    execSync('yarn build', { stdio: 'inherit' });

    console.log('\nInstalling catalyst into test project...\n');

    execSync('yarn add "file:../" --prefer-offline', {
      stdio: 'inherit',
      cwd: testProjectRoot
    });

    writeFileSync(lastBuildTimePath, '');
    utimesSync(lastBuildTimePath, lastBuildTime, lastBuildTime);
  }

  console.log('\nRemoving previous test output...\n');

  execSync('rm -rf dist', {
    stdio: 'inherit',
    cwd: testProjectRoot
  });

  execSync('NODE_ENV=test yarn run catalyst build', {
    stdio: 'inherit',
    cwd: testProjectRoot
  });
};
