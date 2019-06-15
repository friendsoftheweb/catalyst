import webpackConfig from '../index';
import bundlePaths from '../bundlePaths';
import generateEntryForBundleName from '../generateEntryForBundleName';
import Configuration from '../../../Configuration';

jest.mock('../bundlePaths');
jest.mock('../generateEntryForBundleName');

jest.mock('../../../Configuration', () => {
  return function() {
    return {
      rootPath: 'ROOT',
      buildPath: 'BUILD',
      contextPath: 'CONTEXT',
      transformedModules: []
    };
  };
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
