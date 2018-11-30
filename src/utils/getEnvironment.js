function getEnvironment() {
  const env = process.env.NODE_ENV;

  const devServerHost = process.env.DEV_SERVER_HOST || 'localhost';
  const devServerPort = process.env.DEV_SERVER_PORT || 8080;

  return {
    production: env === 'production',
    test: env === 'test',
    development: env !== 'production' && env !== 'test',
    devServerHost,
    devServerPort
  };
}

module.exports = getEnvironment;
