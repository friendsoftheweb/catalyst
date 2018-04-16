const expect = require('expect');
const path = require('path');

const generateEntry = require('../src/config/webpack/generateEntry');
const generateOutput = require('../src/config/webpack/generateOutput');
const generatePlugins = require('../src/config/webpack/generatePlugins');
const generateRules = require('../src/config/webpack/generateRules');

const testProjectRoot = path.resolve(__dirname, './project');

const options = {
  projectRoot: testProjectRoot,
  context: path.join(testProjectRoot, 'client'),
  buildPath: 'public/assets',
  publicPath: '/assets/'
};

describe('config', function() {
  describe('webpack', function() {
    it('generateEntry', function() {
      expect(generateEntry(options)).toBeInstanceOf(Array);
    });

    it('generateOutput', function() {
      expect(generateOutput(options)).toBeInstanceOf(Object);
    });

    it('generatePlugins', function() {
      expect(generatePlugins(options)).toBeInstanceOf(Array);
    });

    it('generateRules', function() {
      expect(generateRules(options)).toBeInstanceOf(Array);
    });
  });
});
