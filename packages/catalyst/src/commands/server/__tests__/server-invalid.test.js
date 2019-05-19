import fs from 'fs';
import SockJS from 'sockjs-client';

import getConfig from '../../../utils/getConfig';
import getEnvironment from '../../../utils/getEnvironment';
import getWebpackConfig from '../getWebpackConfig';

jest.setTimeout(20000);

jest.mock('../../../utils/getConfig');
jest.mock('../../../utils/getEnvironment');
jest.mock('../getWebpackConfig');

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
  getConfig.mockImplementation(() => ({
    rootPath: 'src',
    buildPath: 'public/assets'
  }));

  getEnvironment.mockImplementation(() => ({
    isProduction: false,
    isTest: false,
    isDevelopment: true,
    typeScriptConfigExists: false,
    flowConfigExists: false,
    devServerHost,
    devServerPort
  }));

  getWebpackConfig.mockImplementation(() => ({
    mode: 'development',
    entry: {
      application: entryPath
    }
  }));

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
