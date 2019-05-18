declare global {
  interface Window {
    __CATALYST_ENV__: {
      devServerHost: string;
      devServerPort: number;
    };
  }

  interface NodeModule {
    hot: {
      status(): 'idle';
      check(autoApply: boolean): Promise<any>;
    };
  }
}

import SockJS from 'sockjs-client';

import activityTemplate from './templates/activity.ejs';
import compilationErrorTemplate from './templates/compilation-error.ejs';
import formatCompiliationError from './formatCompilationError';

let overlayContainerHTML: string | null = null;
let overlayFramePromise: Promise<{ frame: HTMLIFrameElement }> | null = null;
let overlayFrameVisible = false;

function createOverlayFrame(): Promise<{ frame: HTMLIFrameElement }> {
  if (overlayFramePromise != null) {
    return overlayFramePromise;
  }

  overlayFramePromise = new Promise(resolve => {
    const frame = document.createElement('iframe');

    frame.src = 'about:blank';
    frame.style.position = 'fixed';
    frame.style.left = '0';
    frame.style.top = '0';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '100vw';
    frame.style.height = '100vh';
    frame.style.border = 'none';
    frame.style.zIndex = '9999999999';
    frame.style.display = overlayFrameVisible ? 'block' : 'none';
    frame.style.opacity = '0.95';

    frame.onload = function() {
      resolve({ frame: frame });
    };

    document.body.appendChild(frame);
  });

  return overlayFramePromise;
}

let overlayContainerPromise: Promise<{
  frame: HTMLIFrameElement;
  container: HTMLDivElement;
}> | null = null;

function createOverlayContainer(): Promise<{
  frame: HTMLIFrameElement;
  container: HTMLDivElement;
}> {
  if (overlayContainerPromise != null) {
    return overlayContainerPromise;
  }

  overlayContainerPromise = new Promise((resolve, reject) => {
    createOverlayFrame()
      .then(elements => {
        if (elements.frame.contentDocument == null) {
          reject();
          return;
        }

        const container = elements.frame.contentDocument.createElement('div');

        container.style.position = 'fixed';
        container.style.boxSizing = 'border-box';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.left = '0';
        container.style.top = '0';
        container.style.right = '0';
        container.style.bottom = '0';
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
    elements.container.innerHTML = overlayContainerHTML || '';
    elements.frame.style.display = overlayFrameVisible ? 'block' : 'none';
  });
}

function showNotification(template: string) {
  overlayFrameVisible = true;
  overlayContainerHTML = template;

  return updateOverlayContainer();
}

function hideNotification() {
  overlayFrameVisible = false;
  overlayContainerHTML = null;

  return updateOverlayContainer();
}

const { devServerPort, devServerHost } = window.__CATALYST_ENV__;

const connection = new SockJS(
  `${window.location.protocol}//${devServerHost}:${devServerPort}/sockjs-node`
);

let isBuilding = false;
let firstCompilationHash: string | null = null;
let lastCompilationHash: string | null = null;
// let hasCompileErrors = false;

connection.onmessage = function(event) {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'invalid':
      if (!isBuilding) {
        isBuilding = true;

        showNotification(activityTemplate({ message: 'Building...' }));
      }

      break;

    case 'hash':
      if (firstCompilationHash == null) {
        firstCompilationHash = message.data;
      }

      lastCompilationHash = message.data;
      break;

    case 'ok':
      isBuilding = false;
      tryApplyUpdates();
      break;

    case 'still-ok':
      isBuilding = false;
      hideNotification();
      break;

    case 'warnings':
      console.warn(...message.data);

      isBuilding = false;
      tryApplyUpdates();

      break;

    case 'errors':
      isBuilding = false;
      // hasCompileErrors = true;

      showNotification(
        compilationErrorTemplate({
          message: formatCompiliationError(message.data[0])
        })
      );

      break;
  }
};

function tryApplyUpdates() {
  if (firstCompilationHash === lastCompilationHash) {
    return Promise.resolve();
  }

  if (!module.hot) {
    window.location.reload();
    return Promise.resolve();
  }

  if (module.hot.status() !== 'idle') {
    hideNotification();
    return Promise.resolve();
  }

  return module.hot
    .check(true)
    .then(hideNotification)
    .catch((error: Error) => {
      window.location.reload();

      throw error;
    });
}
