function getEnvironment() {
  const env = process.env.NODE_ENV;

  return {
    production: env === 'production',
    test: env === 'test',
    development: env !== 'production' && env !== 'test',
    devServerHost: process.env.DEV_SERVER_HOST || 'localhost',
    devServerPort: process.env.DEV_SERVER_PORT || 8080,
    devServerHotPort: process.env.DEV_SERVER_HOT_PORT || 8081
  };
}

module.exports = getEnvironment;
