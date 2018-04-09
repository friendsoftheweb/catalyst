// Heavily inspired by:
// https://github.com/facebookincubator/create-react-app/blob/master/packages/react-dev-utils/webpackHotDevClient.js

const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const getEnvironment = require('../utils/getEnvironment');

let runtimeErrorOccured = false;

let overlayFramePromise = null;
let overlayFrameCreated = false;
let firstLoadComplete = false;

function createOverlayFrame() {
  if (overlayFramePromise != null) {
    return overlayFramePromise;
  }

  overlayFramePromise = new Promise(function(resolve) {
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
    frame.style.opacity = 0.95;

    frame.onload = function() {
      overlayFrameCreated = true;

      resolve({ frame: frame });
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

  overlayContainerPromise = new Promise(function(resolve, reject) {
    createOverlayFrame()
      .then(function(elements) {
        const container = elements.frame.contentDocument.createElement('div');

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

        elements.frame.contentDocument.body.appendChild(container);

        resolve({ frame: elements.frame, container: container });
      })
      .catch(reject);
  });

  return overlayContainerPromise;
}

function showNotification(template) {
  return createOverlayContainer().then(function(elements) {
    elements.container.innerHTML = template;
    elements.frame.style.display = 'block';
  });
}

function hideNotification() {
  if (overlayFrameCreated) {
    return createOverlayFrame().then(function(elements) {
      elements.frame.style.display = 'none';
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
    <div class="compilation-error">
      <h1>Failed to compile</h1>

      <div class="compilation-error-message">${message}</div>
    </div>

    <style>
      h1 {
        color: #ffffff;
        font-size: 1.5em;
        background-color: #EC2F5D;
        margin-bottom: 2em;
        font-weight: normal;
        padding: 0.5em;
      }

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
        font-size: 1em;
        font-family: Menlo, Consolas, monospace;
        line-height: 1.2em;
        padding: 2rem;
        overflow: auto;
      }

      .compilation-error-message {
        white-space: pre;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .compilation-error-message > * {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .file-path {
        font-weight: bold;
        font-size: 1.25em;
        margin-bottom: 1em;
      }

      .code-line {
        background-color: #eeeeee;
        line-height: 1.5em;
      }

      .code-line-indicator {
        color: #A92047;
      }

      .code-line.highlighted {
        background-color: #dddddd;
      }

      @media screen and (max-width: 600px) {
        .compilation-error {
          font-size: 0.8em;
        }
      }
    </style>
  `;
}

function runtimeErrorTemplate(message) {
  return `
    <div class="runtime-error">
      ${message}
    </div>

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

const { devServerHost, devServerHotPort } = getEnvironment();

const socket = new WebSocket(`ws://${devServerHost}:${devServerHotPort}`);

socket.addEventListener('message', function(event) {
  var message = JSON.parse(event.data);

  switch (message.type) {
    case 'ok':
    case 'warnings':
      firstLoadComplete = true;

      if (!runtimeErrorOccured) {
        hideNotification();
      }
      break;
    case 'no-change':
      hideNotification();
      break;
    case 'invalid':
      showNotification(activityTemplate('Reloading...'));
      break;
    case 'errors':
      var formatted = formatWebpackMessages({
        errors: message.data,
        warnings: []
      });

      var message = formatCompiliationError(formatted.errors[0]);

      showNotification(compilationErrorTemplate(message));
      break;
  }
});

function formatCompiliationError(message) {
  return message
    .split('\n')
    .map((line, index) => {
      if (index === 0) {
        return `<div class="file-path">${line}</div>`;
      }

      if (line.length === 0 || /^s+$/.test(line)) {
        return '<br />';
      }

      if (/^>\s+\d+?\s+\|/.test(line)) {
        line = line.replace(/^>/, ' ');

        return `<div class="code-line highlighted">${line}</div>`;
      }

      if (/^\s+|\s+\^/.test(line)) {
        line = line.replace('^', '<span class="code-line-indicator">^</span>');

        return `<div class="code-line">${line}</div>`;
      }

      if (/^\s+(\d+)?\s+\|/.test(line)) {
        return `<div class="code-line">${line}</div>`;
      }

      return `<div>${line}</div>`;
    })
    .join('');
}

// If the body element exists, show the loading indicator. Otherwise, wait for a
// "DOMContentLoaded" event.
if (document.body != null) {
  showNotification(activityTemplate('Loading...'));
} else {
  document.addEventListener('DOMContentLoaded', function() {
    if (!firstLoadComplete) {
      showNotification(activityTemplate('Loading...'));
    }
  });
}

window.onerror = function(message) {
  if (window.outerHeight - window.innerHeight < 100) {
    runtimeErrorOccured = true;
    showNotification(runtimeErrorTemplate(message));
  }
};
