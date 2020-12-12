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
