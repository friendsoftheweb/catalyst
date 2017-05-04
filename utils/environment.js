function environment() {
  const env = process.env.NODE_ENV;

  return {
    production: env === 'production',
    test: env === 'test',
    development: env !== 'production' && env !== 'test',
    devServerHost: process.env.DEV_SERVER_HOST || 'localhost',
    devServerPort: process.env.DEV_SERVER_PORT || 8080
  };
}

module.exports = environment;
