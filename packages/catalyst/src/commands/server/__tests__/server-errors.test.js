import fs from 'fs';
import SockJS from 'sockjs-client';

import getConfig from '../../../utils/getConfig';
import getEnvironment from '../../../utils/getEnvironment';
import getWebpackConfig from '../getWebpackConfig';
import buildVendorPackages from '../buildVendorPackages';

jest.setTimeout(20000);

jest.mock('../../../utils/getConfig');
jest.mock('../../../utils/getEnvironment');
jest.mock('../getWebpackConfig');
jest.mock('../buildVendorPackages');

console.log = jest.fn();
console.info = jest.fn();
console.error = jest.fn();

const devServerHost = 'localhost';
const devServerPort = '8081';
const entryPath = './test-project/errors-entry.js';
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

const invalidSource = `
function parsingError() {
  return 'Not a string
}
`;

import server from '../index';

test('server emits "errors" events via SockJS', (done) => {
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

  fs.writeFile(entryPath, "console.log('ok');", (error) => {
    if (error != null) {
      throw new Error(error);
    }

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
            fs.writeFileSync(entryPath, invalidSource);
          }, 100);
        }

        if (ok && message.type === 'errors') {
          const errorLines = message.data[0].split('\n');

          expect(errorLines).toEqual([
            `${entryPath} 3:9`,
            'Module parse failed: Unterminated string constant (3:9)',
            'You may need an appropriate loader to handle this file type.',
            '| ',
            '| function parsingError() {',
            ">   return 'Not a string",
            '| }',
            '| '
          ]);

          done();
        }
      };
    });
  });
});
