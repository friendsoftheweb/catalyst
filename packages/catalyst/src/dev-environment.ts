declare module 'catalyst' {
  global {
    interface Window {
      __CATALYST_ENV__: {
        devServerProtocol: string | undefined;
        devServerHost: string | undefined;
        devServerPort: string | undefined;
      };
    }
  }
}

window.__CATALYST_ENV__ = {
  devServerProtocol: process.env.DEV_SERVER_PROTOCOL,
  devServerHost: process.env.DEV_SERVER_HOST,
  devServerPort: process.env.DEV_SERVER_PORT,
};
