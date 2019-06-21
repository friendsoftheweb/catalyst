import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import build from '../index';
import Configuration from '../../../Configuration';

console.log = jest.fn();

jest.mock('../../../Configuration', () => {
  return function() {
    const path = require('path');
    const rootPath = path.join(process.cwd(), 'fixtures/build');
    const contextPath = path.join(rootPath, 'src');

    return {
      environment: 'test',
      rootPath,
      buildPath: path.join(rootPath, 'dist'),
      contextPath,
      bundlesPath: path.join(contextPath, 'bundles'),
      transformedModules: []
    };
  };
});

const distPath = path.join(process.cwd(), 'fixtures/build/dist');

beforeEach(() => {
  execSync(`rm -rf ${distPath}`);
});

test('creates a "manifest.json" file', async () => {
  await build();

  expect(fs.existsSync(path.join(distPath, 'manifest.json'))).toBe(true);
});
