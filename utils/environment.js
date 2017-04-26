function environment() {
  const env = process.env.NODE_ENV;

  return {
    production: env === 'production',
    test: env === 'test',
    development: env !== 'production' && env !== 'test'
  };
}

module.exports = environment;
