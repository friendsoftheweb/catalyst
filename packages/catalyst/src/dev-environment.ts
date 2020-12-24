declare module 'catalyst' {
  import { Environment } from 'catalyst-client/lib/types';

  global {
    interface Window {
      __CATALYST_ENV__: Environment;
    }
  }
}

window.__CATALYST_ENV__ = {
  devServerProtocol: process.env.DEV_SERVER_PROTOCOL,
  devServerHost: process.env.DEV_SERVER_HOST,
  devServerPort: process.env.DEV_SERVER_PORT,
  contextPath: process.env.CONTEXT_PATH,
};
