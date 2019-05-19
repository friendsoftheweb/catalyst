import fs from 'fs';
import SockJS from 'sockjs-client';

import getConfig from '../../../utils/getConfig';
import getWebpackConfig from '../getWebpackConfig';

console.log = jest.fn();
console.info = jest.fn();
console.error = jest.fn();

jest.mock('../../../utils/getConfig');
jest.mock('../getWebpackConfig');

jest.setTimeout(10000);

const invalidSource = `
function parsingError() {
  return 'Not a string
}
`;

import server from '../index';

const entryPath = './test-project/entry2.js';

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
      const connection = new SockJS('http://localhost:8080/sockjs-node');

      let ok = false;

      connection.onmessage = function(event) {
        const message = JSON.parse(event.data);

        if (message.type === 'ok') {
          ok = true;

          fs.writeFile(entryPath, invalidSource, () => {});
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

          connection.close();
          webpackDevServer.close();
          done();
        }
      };
    });
  });
});
