// Heavily inspired by:
// https://github.com/facebookincubator/create-react-app/blob/master/packages/react-dev-utils/webpackHotDevClient.js

const SockJS = require('sockjs-client');
const url = require('url');
const environment = require('./utils/environment');

let isFirstCompilation = true;
let runtimeErrorOccured = false;

let overlayFramePromise = null;
let overlayFrameCreated = false;

function createOverlayFrame() {
  if (overlayFramePromise != null) {
    return overlayFramePromise;
  }

  overlayFramePromise = new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');

    frame.src = 'about:blank';
    frame.style.position = 'fixed';
    frame.style.left = 0;
    frame.style.top = 0;
    frame.style.right = 0;
    frame.style.bottom = 0;
    frame.style.width = '100vw';
    frame.style.height = '100vh';
    frame.style.border = 'none';
    frame.style.zIndex = 9999999999;
    frame.style.display = 'none';
    frame.style.pointerEvents = 'none';

    frame.onload = () => {
      overlayFrameCreated = true;

      resolve({ frame });
    };

    document.body.appendChild(frame);
  });

  return overlayFramePromise;
}

let overlayContainerPromise = null;

function createOverlayContainer() {
  if (overlayContainerPromise != null) {
    return overlayContainerPromise;
  }

  overlayContainerPromise = new Promise((resolve, reject) => {
    createOverlayFrame()
      .then(({ frame }) => {
        const container = frame.contentDocument.createElement('div');

        container.style.position = 'fixed';
        container.style.boxSizing = 'border-box';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.left = 0;
        container.style.top = 0;
        container.style.right = 0;
        container.style.bottom = 0;
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.backgroundColor = 'rgba(255,255,255,0.25)';

        frame.contentDocument.body.appendChild(container);

        resolve({ frame, container });
      })
      .catch(reject);
  });

  return overlayContainerPromise;
}

function showNotification(template) {
  return createOverlayContainer().then(({ frame, container }) => {
    container.innerHTML = template;
    frame.style.display = 'block';
  });
}

function hideNotification() {
  if (overlayFrameCreated) {
    return createOverlayFrame().then(({ frame }) => {
      frame.style.display = 'none';
    });
  } else {
    return Promise.resolve(null);
  }
}

function activityTemplate(message) {
  return `
    <div class="activity">
      <div class="activity-indicator"></div>
      <div class="activity-message">${message}</div>
    </div>

    <style>
      @keyframes rotation {
        0% { transform: rotate(0); }
        100% { transform: rotate(350deg); }
      }

      .activity {
        position: fixed;
        background-color: rgba(0,0,0,0.8);
        border-radius: 0.5rem;
        font-family: Lucida Grande, sans-serif;
        padding: 0.75em 1em;
        text-align: center;
        vertical-align: middle;
      }

      .activity-indicator {
        display: inline-block;
        animation: rotation 0.85s infinite linear;
        vertical-align: middle;

        font-size: 17px;
        width: 1em;
        height: 1em;

        border: 2px solid rgba(255,255,255,0.25);
        border-top-color: rgba(255,255,255,0.7);
        border-radius: 50%;
      }

      .activity-message {
        color: rgba(255,255,255,0.5);
        margin-left: 0.4em;
        padding-top: 0.25em;
        display: inline-block;
        -webkit-font-smoothing: antialiased
      }
    </style>
`;
}

function compilationErrorTemplate(message) {
  return `
    <div class="compilation-error"><div class="compilation-error-heading">Failed to compile.</div>${message}</div>

    <style>
      .compilation-error {
        position: fixed;
        box-sizing: border-box;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        color: #333333;
        background-color: #fafafa;
        font-size: large;
        font-family: Menlo, Consolas, monospace;
        line-height: 1.2em;
        padding: 2rem;
        white-space: pre-wrap;
        overflow: auto;
      }

      .compilation-error-heading {
        color: #E36049;
        margin-bottom: 2em;
      }
    </style>
`;
}

function runtimeErrorTemplate(message) {
  return `
    <div class="runtime-error">${message}</div>

    <style>
      .runtime-error {
        position: fixed;
        box-sizing: border-box;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 2.5em;
        background-color: rgba(255,0,0,0.75);
        font-size: 12px;
        line-height: 2.5em;
        text-align: center;
        color: rgba(255,255,255,0.95);
        font-family: Lucida Grande, sans-serif;
        overflow: hidden;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        -webkit-font-smoothing: antialiased;
      }
    </style>
`;
}

function tryApplyUpdates() {
  if (isFirstCompilation) {
    isFirstCompilation = false;
    return;
  }

  if (!module.hot) {
    window.location.reload();
    return;
  }

  if (module.hot.status() !== 'idle') {
    return;
  }

  console.log('Applying update');

  module.hot.check(true).then(
    () => {
      console.log('HMR update applied');
    },
    () => {
      window.location.reload();
    }
  );
}

const connection = new SockJS(
  url.format({
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: environment().devServerPort,
    // Hardcoded in WebpackDevServer
    pathname: '/sockjs-node'
  })
);

connection.onmessage = function(event) {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'ok':
    case 'warnings':
      if (!runtimeErrorOccured) {
        hideNotification();
      }
      tryApplyUpdates();
      break;
    case 'still-ok':
      hideNotification();
      break;
    case 'invalid':
      showNotification(activityTemplate('Reloading...'));
      break;
    case 'errors':
      showNotification(
        compilationErrorTemplate(escapeErrorMessage(message.data.toString()))
      );
      break;
  }
};

function escapeErrorMessage(message) {
  return message
    .replace(/\[\d\d?m/g, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

document.addEventListener('DOMContentLoaded', () => {
  showNotification(activityTemplate('Loading...'));
});

window.onerror = function(message) {
  if (window.outerHeight - window.innerHeight < 100) {
    runtimeErrorOccured = true;
    showNotification(runtimeErrorTemplate(message));
  }
};
