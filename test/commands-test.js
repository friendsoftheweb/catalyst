const expect = require('expect');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const { execSync } = require('child_process');

const testProjectRoot = path.resolve(__dirname, './project');

describe('commands', function() {
  beforeEach(function() {
    execSync(`mkdir ${testProjectRoot}`);
  });

  afterEach(function() {
    execSync(`rm -rf ${testProjectRoot}`);
  });

  describe('generate component', function() {
    it('should throw an error if package.json is missing', function() {
      expect(() => {
        execSync('../../index.js generate component HelloWorld', {
          cwd: testProjectRoot
        });
      }).toThrow();
    });

    it('should not throw an error if package.json is present', function() {
      expect(() => {
        fs.writeFileSync(
          path.resolve(testProjectRoot, './package.json'),
          JSON.stringify({ catalyst: { rootPath: 'client' } })
        );

        execSync('../../index.js generate component HelloWorld', {
          cwd: testProjectRoot
        });
      }).toNotThrow();
    });
  });

  describe('generate module', function() {
    it('should throw an error if package.json is missing', function() {
      expect(() => {
        execSync('../../index.js generate module HelloWorld', {
          cwd: testProjectRoot
        });
      }).toThrow();
    });

    it('should not throw an error if package.json is present', function() {
      expect(() => {
        fs.writeFileSync(
          path.resolve(testProjectRoot, './package.json'),
          JSON.stringify({ catalyst: { rootPath: 'client' } })
        );

        execSync('../../index.js generate module HelloWorld', {
          cwd: testProjectRoot
        });
      }).toNotThrow();
    });
  });
});
