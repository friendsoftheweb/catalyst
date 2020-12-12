const { execSync } = require('child_process');
const {
  existsSync,
  statSync,
  utimesSync,
  writeFileSync,
  readFileSync
} = require('fs');
const { join, resolve, parse } = require('path');
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

  for (const filePath of glob.sync('../*/src/**/*.*')) {
    if (filePath.includes('__tests__')) continue;

    if (statSync(filePath).mtime > lastBuildTime) {
      return true;
    }
  }

  return false;
}

module.exports = async function () {
  if (shouldBuild()) {
    const lastBuildTime = new Date();

    for (const relativePackagePath of glob.sync('../*')) {
      const packagePath = resolve(__dirname, relativePackagePath);
      const packageName = parse(packagePath).name;

      console.log(`\n---> Building ${packageName}...\n`);

      execSync('yarn link', { stdio: 'inherit', cwd: packagePath });
      execSync('yarn build', { stdio: 'inherit', cwd: packagePath });

      console.log(`\n---> Linking ${packageName} into test project...\n`);

      execSync(`yarn link ${packageName}`, {
        stdio: 'inherit',
        cwd: testProjectRoot
      });
    }

    execSync('rm -rf node_modules/.cache', {
      stdio: 'inherit',
      cwd: testProjectRoot
    });

    writeFileSync(lastBuildTimePath, '');
    utimesSync(lastBuildTimePath, lastBuildTime, lastBuildTime);
  }

  console.log('\n---> Removing previous test output...\n');

  execSync('rm -rf dist', {
    stdio: 'inherit',
    cwd: testProjectRoot
  });

  execSync('NODE_ENV=test yarn run catalyst build', {
    stdio: 'inherit',
    cwd: testProjectRoot
  });
};
