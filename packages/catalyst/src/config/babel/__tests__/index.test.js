import babelConfig from '../index';
import getConfig from '../../../utils/getConfig';

jest.mock('../../../utils/getConfig');

describe('babelConfig()', () => {
  test('generates a configuration', () => {
    getConfig.mockImplementation(() => ({
      rootPath: 'ROOT',
      buildPath: 'BUILD'
    }));

    const config = babelConfig();

    expect(config.presets.length).toBeGreaterThan(0);
    expect(config.plugins.length).toBeGreaterThan(0);
  });
});
