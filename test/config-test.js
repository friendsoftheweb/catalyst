const expect = require('expect');
const path = require('path');

const generateDevtool = require('../config/webpack/generate-devtool');
const generateEntry = require('../config/webpack/generate-entry');
const generateOutput = require('../config/webpack/generate-output');
const generatePlugins = require('../config/webpack/generate-plugins');
const generateRules = require('../config/webpack/generate-rules');

const testProjectRoot = path.resolve(__dirname, './project');

const options = { context: testProjectRoot, rootPath: 'client', buildPath: 'public/assets' };

describe('config', function() {
  describe('webpack', function() {
    it('generateDevtool', function() {
      expect(generateDevtool(options)).toBeA('string');
    });

    it('generateEntry', function() {
      expect(generateEntry(options)).toBeAn(Array);
    });

    it('generateOutput', function() {
      expect(generateOutput(options)).toBeAn(Object);
    });

    it('generatePlugins', function() {
      expect(generatePlugins(options)).toBeAn(Array);
    });

    it('generateRules', function() {
      expect(generateRules(options)).toBeAn(Array);
    });
  });
});
