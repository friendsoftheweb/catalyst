import fs from 'fs';
import SockJS from 'sockjs-client';
// import webpackConfig from '../index';
// import bundlePaths from '../bundlePaths';
// import generateEntryForBundleName from '../generateEntryForBundleName';
import getConfig from '../../utils/getConfig';
import getWebpackConfig from '../server/getWebpackConfig';

console.log = jest.fn();
console.info = jest.fn();

// jest.mock('../bundlePaths');
// jest.mock('../generateEntryForBundleName');
jest.mock('../../utils/getConfig');
jest.mock('../server/getWebpackConfig');

jest.setTimeout(10000);

import server from '../server';

describe('server()', () => {
  test('works', (done) => {
    getConfig.mockImplementation(() => ({
      rootPath: 'ROOT',
      buildPath: 'BUILD'
    }));

    getWebpackConfig.mockImplementation(() => ({
      mode: 'development',
      entry: {
        application: './test/entry'
      }
    }));

    server().then(() => {
      const connection = new SockJS('http://localhost:8080/sockjs-node');

      let ok = false;

      connection.onmessage = function(event) {
        const message = JSON.parse(event.data);

        if (message.type === 'ok') {
          ok = true;

          fs.appendFileSync('./test/entry.js', "console.log('hello'");
          // done();
        }

        if (ok && message.type === 'invalid') {
          done();
        }
        // console.log('MSG', message);
        // done();
      };

      // const fs = require('fs');

      // connection.onerror = (err) => {
      //   console.log(err);
      // };

      // connection.onopen = () => {
      //   console.log('OPEN');
      // };

      // setTimeout(done, 3000);
    });

    // bundlePaths.mockImplementation(() => ['application', 'admin']);
    // generateEntryForBundleName.mockImplementation(() => ['entry.js']);

    // const config = webpackConfig();
    // expect(config.mode).toBe('development');
    // expect(config.devtool).toBe('cheap-module-source-map');
  });
});
