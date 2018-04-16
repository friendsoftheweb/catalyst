const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const expect = require('expect');

const { projectRootPath, commandPath, createProject } = require('./support');

describe('commands', function() {
  after(function() {
    execSync(`rm -rf ${path.join(projectRootPath, 'test/projects')}`);
  });

  describe('build', function() {
    this.timeout(7500);

    beforeEach(function() {
      this.testProjectRoot = createProject();
    });

    it('builds the project', function() {
      fs.writeFileSync(
        path.resolve(
          this.testProjectRoot,
          './client/bundles/application/index.js'
        ),
        'console.log("Hello World")'
      );

      execSync(
        `ln -s ${projectRootPath}/node_modules ${
          this.testProjectRoot
        }/node_modules`,
        {
          cwd: this.testProjectRoot
        }
      );

      execSync(`${commandPath} build`, {
        cwd: this.testProjectRoot
      });

      const applicationContents = fs
        .readFileSync(
          path.resolve(this.testProjectRoot, './public/assets/application.js')
        )
        .toString();

      expect(applicationContents).toMatch(/Hello World/);
    });
  });

  describe('generate component', function() {
    it('should throw an error if package.json is missing', function() {
      this.testProjectRoot = createProject({ createPackageFile: false });

      expect(() => {
        execSync(`${commandPath} generate component HelloWorld`, {
          cwd: this.testProjectRoot
        });
      }).toThrow();
    });

    it('should not throw an error if package.json is present', function() {
      this.testProjectRoot = createProject();

      expect(() => {
        execSync(`${commandPath} generate component HelloWorld`, {
          cwd: this.testProjectRoot
        });
      }).not.toThrow();
    });
  });

  describe('generate module', function() {
    it('should throw an error if package.json is missing', function() {
      this.testProjectRoot = createProject({ createPackageFile: false });

      expect(() => {
        execSync(`${commandPath} generate module HelloWorld`, {
          cwd: this.testProjectRoot
        });
      }).toThrow();
    });

    it('should not throw an error if package.json is present', function() {
      this.testProjectRoot = createProject();

      expect(() => {
        execSync(`${commandPath} generate module HelloWorld`, {
          cwd: this.testProjectRoot
        });
      }).not.toThrow();
    });
  });
});
