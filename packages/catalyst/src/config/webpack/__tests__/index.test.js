import webpackConfig from '../index';
import bundlePaths from '../bundlePaths';
import generateEntryForBundleName from '../generateEntryForBundleName';
import getConfig from '../../../utils/getConfig';

jest.mock('../bundlePaths');
jest.mock('../generateEntryForBundleName');
jest.mock('../../../utils/getConfig');

describe('webpackConfig()', () => {
  test('generates a configuration', () => {
    bundlePaths.mockImplementation(() => ['application', 'admin']);

    generateEntryForBundleName.mockImplementation(() => ['entry.js']);

    getConfig.mockImplementation(() => ({
      rootPath: 'ROOT',
      buildPath: 'BUILD'
    }));

    const config = webpackConfig();

    expect(config.mode).toBe('development');
    expect(config.devtool).toBe('cheap-module-source-map');
  });
});
