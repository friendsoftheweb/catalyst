import webpackConfig from '../index';
import bundlePaths from '../bundlePaths';
import generateEntryForBundleName from '../generateEntryForBundleName';

jest.mock('../bundlePaths');
jest.mock('../generateEntryForBundleName');

jest.mock('../../../Configuration', () => {
  class MockConfiguration {
    static fromFile() {
      return new MockConfiguration();
    }

    rootPath = 'ROOT';
    buildPath = 'BUILD';
    contextPath = 'CONTEXT';
    projectName = 'catalyst-test';
    transformedPackages = [];
    plugins = [];
  }

  return MockConfiguration;
});

describe('webpackConfig()', () => {
  test('generates a configuration', () => {
    bundlePaths.mockImplementation(() => ['application', 'admin']);

    generateEntryForBundleName.mockImplementation(() => ['entry.js']);

    const config = webpackConfig();

    expect(config.mode).toBe('development');
    expect(config.devtool).toBe('cheap-module-source-map');
  });
});
