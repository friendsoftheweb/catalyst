import fs from 'fs';
import SockJS from 'sockjs-client';

import Configuration from '../../../Configuration';
import getWebpackConfig from '../../../utils/getWebpackConfig';
import prebuildVendorPackages from '../prebuildVendorPackages';

console.log = jest.fn();
console.info = jest.fn();
console.error = jest.fn();

jest.setTimeout(20000);

jest.mock('../../../Configuration', () => {
  return function() {
    return {
      environment: 'development',
      contextPath: 'src',
      tempPath: 'tmp',
      devServerHost: 'localhost',
      devServerPort: 8081
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
  fs.writeFile(
    './test-project/errors-entry.js',
    "console.log('ok');",
    (error) => {
      if (error != null) {
        throw new Error(error);
      }

      server().then((devSever) => {
        webpackDevServer = devSever;

        sockJSConnection = new SockJS(`http://localhost:8081/sockjs-node`);

        let ok = false;

        sockJSConnection.onmessage = function(event) {
          const message = JSON.parse(event.data);

          if (message.type === 'ok') {
            ok = true;

            setTimeout(() => {
              fs.writeFileSync('./test-project/errors-entry.js', invalidSource);
            }, 100);
          }

          if (ok && message.type === 'errors') {
            const errorLines = message.data[0].split('\n');

            expect(errorLines).toEqual([
              `./test-project/errors-entry.js 3:9`,
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
    }
  );
});
