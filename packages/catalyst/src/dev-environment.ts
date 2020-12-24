declare module 'catalyst' {
  global {
    interface Window {
      __CATALYST_ENV__: {
        devServerProtocol: string | undefined;
        devServerHost: string | undefined;
        devServerPort: string | undefined;
        contextPath: string | undefined;
      };
    }
  }
}

window.__CATALYST_ENV__ = {
  devServerProtocol: process.env.DEV_SERVER_PROTOCOL,
  devServerHost: process.env.DEV_SERVER_HOST,
  devServerPort: process.env.DEV_SERVER_PORT,
  contextPath: process.env.CONTEXT_PATH,
};
