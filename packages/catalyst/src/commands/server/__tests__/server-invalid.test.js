import fs from 'fs';
import SockJS from 'sockjs-client';

import Configuration from '../../../Configuration';
import getWebpackConfig from '../../../utils/getWebpackConfig';
import prebuildVendorPackages from '../prebuildVendorPackages';

jest.setTimeout(20000);

jest.mock('../../../Configuration', () => {
  return function() {
    return {
      environment: 'development',
      contextPath: 'src',
      tempPath: 'tmp',
      devServerHost: 'localhost',
      devServerPort: 8082
    };
  };
});

jest.mock('../../../utils/getWebpackConfig', () => {
  return function() {
    return Promise.resolve({
      mode: 'development',
      entry: {
        application: './test-project/errors-entry.js'
      }
    });
  };
});

jest.mock('../prebuildVendorPackages');

console.log = jest.fn();
console.info = jest.fn();
console.error = jest.fn();

const devServerHost = 'localhost';
const devServerPort = '8082';
const entryPath = './test-project/invalid-entry.js';
let webpackDevServer;
let sockJSConnection;

afterEach(() => {
  if (sockJSConnection != null) {
    sockJSConnection.close();
  }

  if (webpackDevServer != null) {
    webpackDevServer.close();
  }
});

import server from '../index';

test('server emits "invalid" events via SockJS', (done) => {
  fs.writeFile(entryPath, "console.log('Hello World');", () => {
    server().then((devSever) => {
      webpackDevServer = devSever;

      sockJSConnection = new SockJS(
        `http://${devServerHost}:${devServerPort}/sockjs-node`
      );

      let ok = false;

      sockJSConnection.onmessage = function(event) {
        const message = JSON.parse(event.data);

        if (message.type === 'ok') {
          ok = true;

          setTimeout(() => {
            fs.writeFileSync(entryPath, "console.log('Hello World Updated');");
          }, 100);
        }

        if (ok && message.type === 'invalid') {
          done();
        }
      };
    });
  });
});
