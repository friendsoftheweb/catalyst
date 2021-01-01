import babelConfig from '../index';
import Configuration from '../../../Configuration';

jest.mock('../../../Configuration', () => {
  class MockConfiguration {
    static fromFile() {
      return new MockConfiguration();
    }

    rootPath = 'ROOT';
    buildPath = 'BUILD';
    plugins = [];
  }

  return MockConfiguration;
});

describe('babelConfig()', () => {
  test('generates a configuration', () => {
    const config = babelConfig();

    expect(config.presets.length).toBeGreaterThan(0);
    expect(config.plugins.length).toBeGreaterThan(0);
  });
});
