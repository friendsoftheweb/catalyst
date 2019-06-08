import Configuration from './Configuration';

const configuration = new Configuration();

// @ts-ignore
window.__CATALYST_ENV__ = {
  devServerHost: configuration.devServerHost,
  devServerPort: configuration.devServerPort
};
