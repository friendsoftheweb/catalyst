import fs from 'fs';
import SockJS from 'sockjs-client';

import getConfig from '../../../utils/getConfig';
import getWebpackConfig from '../getWebpackConfig';

const consoleLog = console.log;

console.log = jest.fn();
console.info = jest.fn();
console.error = jest.fn();

jest.mock('../../../utils/getConfig');
jest.mock('../getWebpackConfig');

jest.setTimeout(60000);

const invalidSource = `
function parsingError() {
  return 'Not a string
}
`;

import server from '../index';

const entryPath = './test-project/entry2.js';

let devSever;
let connection;

afterEach(() => {
  if (connection != null) {
    connection.close();
  }

  if (devSever != null) {
    devSever.close();
  }
});

test('works 2', (done) => {
  getConfig.mockImplementation(() => ({
    rootPath: 'ROOT',
    buildPath: 'BUILD'
  }));

  getWebpackConfig.mockImplementation(() => ({
    mode: 'development',
    entry: {
      application: entryPath
    }
  }));

  fs.writeFile(entryPath, "console.log('ok');", () => {
    server().then((webpackDevServer) => {
      devSever = webpackDevServer;
      connection = new SockJS('http://localhost:8080/sockjs-node');

      let ok = false;

      connection.onmessage = function(event) {
        const message = JSON.parse(event.data);

        consoleLog(message);

        if (message.type === 'ok') {
          ok = true;

          fs.writeFileSync(entryPath, invalidSource);
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
