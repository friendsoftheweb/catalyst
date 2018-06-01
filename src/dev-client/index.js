const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const getEnvironment = require('../utils/getEnvironment');
const activityTemplate = require('./templates/activity');
const compilationErrorTemplate = require('./templates/compilation-error');
const runtimeErrorTemplate = require('./templates/runtime-error');

let runtimeErrorOccured = false;
let overlayFramePromise = null;
let overlayFrameCreated = false;
let firstLoadComplete = false;

function createOverlayFrame() {
  if (overlayFramePromise != null) {
    return overlayFramePromise;
  }

  overlayFramePromise = new Promise(resolve => {
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

  overlayContainerPromise = new Promise((resolve, reject) => {
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

const { devServerHost, devServerHotPort } = getEnvironment();
const socket = new WebSocket(`ws://${devServerHost}:${devServerHotPort}`);

socket.addEventListener('error', event => {
  hideNotification();
});

socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);

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
      showNotification(activityTemplate({ message: 'Reloading...' }));
      break;
    case 'errors':
      const formatted = formatWebpackMessages({
        errors: message.data,
        warnings: []
      });

      showNotification(
        compilationErrorTemplate({
          message: formatCompiliationError(formatted.errors[0])
        })
      );
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

      line = line.replace(/</g, '&lt;');
      line = line.replace(/([^^])(>)/g, '$1&gt;');

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
  showNotification(activityTemplate({ message: 'Loading...' }));
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (!firstLoadComplete) {
      showNotification(activityTemplate({ message: 'Loading...' }));
    }
  });
}

window.onerror = function(message) {
  if (window.outerHeight - window.innerHeight < 100) {
    runtimeErrorOccured = true;
    showNotification(runtimeErrorTemplate({ message }));
  }
};
