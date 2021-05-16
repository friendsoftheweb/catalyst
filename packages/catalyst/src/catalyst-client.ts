/// <reference lib="DOM" />

if (window.__CATALYST__ == null) {
  if (process.env.CATALYST_CONFIGURATION == null) {
    throw new Error('Catalyst client configuration is missing');
  }

  window.__CATALYST__ = {
    ...JSON.parse(process.env.CATALYST_CONFIGURATION),
    logger: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      error() {},
    },
  };
}
