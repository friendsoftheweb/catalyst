import babelConfig from '../index';
import Configuration from '../../../Configuration';

jest.mock('../../../Configuration', () => {
  return function() {
    return {
      rootPath: 'ROOT',
      buildPath: 'BUILD',
      plugins: []
    };
  };
});

describe('babelConfig()', () => {
  test('generates a configuration', () => {
    const config = babelConfig();

    expect(config.presets.length).toBeGreaterThan(0);
    expect(config.plugins.length).toBeGreaterThan(0);
  });
});
