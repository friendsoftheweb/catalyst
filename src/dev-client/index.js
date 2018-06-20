import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import activityTemplate from './templates/activity';
import compilationErrorTemplate from './templates/compilation-error';
import runtimeErrorTemplate from './templates/runtime-error';
import formatCompiliationError from './formatCompilationError';

let runtimeErrorOccured = false;
let overlayContainerHTML = null;
let overlayFramePromise = null;
let overlayFrameCreated = false;
let overlayFrameVisible = false;
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
    frame.style.display = overlayFrameVisible ? 'block' : 'none';
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
      .then(elements => {
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

function updateOverlayContainer() {
  return createOverlayContainer().then(elements => {
    elements.container.innerHTML = overlayContainerHTML;
    elements.frame.style.display = overlayFrameVisible ? 'block' : 'none';
  });
}

function showNotification(template) {
  overlayFrameVisible = true;
  overlayContainerHTML = template;

  return updateOverlayContainer();
}

function hideNotification() {
  overlayFrameVisible = false;
  overlayContainerHTML = null;

  return updateOverlayContainer();
}

const { devServerHost, devServerHotPort } = window.__CATALYST_ENV__;
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
