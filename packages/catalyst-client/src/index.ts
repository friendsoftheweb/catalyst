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

// @ts-ignore
import activityTemplate from './templates/activity';
// @ts-ignore
import compilationErrorTemplate from './templates/compilation-error';

import createOverlayContainer from './createOverlayContainer';
import formatCompiliationError from './formatCompilationError';

let overlayContainerHTML: string | null = null;
let overlayFrameVisible = false;

function updateOverlayContainer() {
  return createOverlayContainer().then((elements) => {
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
