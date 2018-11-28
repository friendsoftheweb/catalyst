function getEnvironment() {
  const env = process.env.NODE_ENV;

  const devServerHost = process.env.DEV_SERVER_HOST || 'localhost';
  const devServerPort = process.env.DEV_SERVER_PORT || 8080;
  const devServerHotPort = process.env.DEV_SERVER_HOT_PORT || 8081;
  const devClientPort = process.env.DEV_CLIENT_PORT || devServerPort;

  return {
    production: env === 'production',
    test: env === 'test',
    development: env !== 'production' && env !== 'test',
    devServerHost,
    devServerPort,
    devServerHotPort,
    devClientPort
  };
}

module.exports = getEnvironment;
