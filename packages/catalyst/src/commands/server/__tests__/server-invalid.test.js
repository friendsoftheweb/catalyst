import fs from 'fs';
import SockJS from 'sockjs-client';

import getConfig from '../../../utils/getConfig';
import getEnvironment from '../../../utils/getEnvironment';
import getWebpackConfig from '../getWebpackConfig';

jest.mock('../../../utils/getConfig');
jest.mock('../../../utils/getEnvironment');
jest.mock('../getWebpackConfig');

console.log = jest.fn();
console.info = jest.fn();

const entryPath = './test-project/entry.js';

jest.setTimeout(10000);

import server from '../index';

test('works', (done) => {
  getConfig.mockImplementation(() => ({
    rootPath: 'ROOT',
    buildPath: 'BUILD'
  }));

  getEnvironment.mockImplementation(() => ({
    isProduction: false,
    isTest: false,
    isDevelopment: true,
    typeScriptConfigExists: false,
    flowConfigExists: false,
    devServerHost: 'localhost',
    devServerPort: '8090'
  }));

  getWebpackConfig.mockImplementation(() => ({
    mode: 'development',
    entry: {
      application: entryPath
    }
  }));

  fs.writeFile(entryPath, "console.log('Hello World');", () => {
    server().then(() => {
      const connection = new SockJS('http://localhost:8090/sockjs-node');

      let ok = false;

      connection.onmessage = function(event) {
        const message = JSON.parse(event.data);

        if (message.type === 'ok') {
          ok = true;

          fs.writeFile(
            entryPath,
            "console.log('Hello World Updated');",
            () => {}
          );
        }

        if (ok && message.type === 'invalid') {
          done();
        }
      };
    });
  });
});
