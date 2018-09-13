const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const WebSocket = require('ws');
const { get, map, uniq } = require('lodash/fp');
const serve = require('webpack-serve');
const Router = require('koa-router');
const findProcess = require('find-process');
const { getDirectories, getEnvironment, log } = require('../utils');

class SocketServer {
  constructor() {
    const { devClientPort } = getEnvironment();

    this.server = new WebSocket.Server({ port: devClientPort });
    this.clients = [];
    this.lastMessage = null;

    this.server.on('connection', client => {
      this.clients.push(client);

      if (this.lastMessage != null) {
        client.send(this.lastMessage);
      }
    });
  }

  broadcast(type, data = {}) {
    this.lastMessage = JSON.stringify({ type, data });

    for (const client of this.clients) {
      if (client.readyState === 1) {
        client.send(this.lastMessage);
      }
    }
  }
}

async function server(options) {
  const { devServerHost, devServerPort, devServerHotPort } = getEnvironment();

  const serverProcesses = await findProcess('port', devServerPort);
  const serverHotProcesses = await findProcess('port', devServerHotPort);

  if (serverProcesses.length > 0 || serverHotProcesses > 0) {
    const processIDs = uniq([
      ...map(get('pid'), serverProcesses),
      ...map(get('pid'), serverHotProcesses)
    ]);

    log.exitWithError(`
  ERROR: Catalyst server failed to start!

         Other processes are currently running on port ${devServerPort} and/or ${devServerHotPort}.
         You can run 'kill -9 ${processIDs.join(' ')}' to stop them.
    `);
  }

  const directories = getDirectories();
  const router = new Router();
  const vendorFilePath = path.join(directories.temp, 'vendor-dll.js');

  router.get('/vendor-dll.js', ctx => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.body = fs.readFileSync(vendorFilePath);
  });

  // Add a route to fall back to during development if "common.js" is not
  // generated (because it's unnecessary).
  router.get('/common.js', ctx => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.body = '// This file left intentially blank.';
  });

  const socketServer = new SocketServer();

  console.log('Prebuilding vendor packages...\n');

  const output = execSync(
    [
      'yarn',
      'run',
      'webpack',
      `--config=${path.resolve(__dirname, '../config/webpack/dll-config.js')}`,
      '--display-error-details',
      '--hide-modules',
      '--bail',
      '--color'
    ].join(' ')
  );

  console.log(output.toString());

  const argv = {};
  const config = require(path.join(directories.context, 'config/webpack.js'));
  const hotClient = options.hot
    ? {
        port: devServerHotPort,
        allEntries: true
      }
    : false;

  serve(argv, {
    config,
    host: devServerHost,
    port: devServerPort,
    clipboard: false,
    devMiddleware: {
      headers: { 'Access-Control-Allow-Origin': '*' },
      logLevel: 'warn'
    },
    hotClient,
    add(app, middleware) {
      middleware.webpack().then(() => {
        middleware.content();

        app.use(router.routes());
      });
    }
  })
    .then(server => {
      server.on('build-started', () => {
        socketServer.broadcast('build-started');
      });

      server.on('build-finished', ({ stats, compiler }) => {
        socketServer.broadcast('build-finished', {
          errors: stats.toJson().errors
        });
      });

      server.on('compiler-error', ({ json }) => {
        socketServer.broadcast('compiler-error', {
          errors: json.errors
        });
      });
    })
    .catch(console.error);
}

module.exports = server;
