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
// @ts-ignore
import runtimeErrorsTemplate from './templates/runtime-errors';

import createOverlayContainer from './createOverlayContainer';
import formatCompiliationError from './formatCompilationError';

let overlayContainerHTML: string | null = null;
let overlayFrameVisible = false;
let overlayFramePointerEvents = 'none';
let runtimeErrorCount = 0;

function updateOverlayContainer(): Promise<void> {
  return createOverlayContainer().then(({ frame, container }) => {
    frame.style.display = overlayFrameVisible ? 'block' : 'none';
    frame.style.pointerEvents = overlayFramePointerEvents;

    container.style.backgroundColor =
      overlayFramePointerEvents === 'none'
        ? 'transparent'
        : 'rgba(255,255,255,0.25)';
    container.innerHTML = overlayContainerHTML || '';
  });
}

function showNotification(
  template: string,
  options: { pointerEvents: 'auto' | 'none' } = { pointerEvents: 'none' }
): Promise<any> {
  overlayFrameVisible = true;
  overlayContainerHTML = template;
  overlayFramePointerEvents = options.pointerEvents;

  return updateOverlayContainer();
}

function hideNotification(): Promise<void> {
  overlayFrameVisible = false;
  overlayContainerHTML = null;

  return updateOverlayContainer();
}

const { devServerPort, devServerHost } = window.__CATALYST_ENV__;
const { protocol } = window.location;

const connection = new SockJS(
  `${protocol}//${devServerHost}:${devServerPort}/sockjs-node`
);

let isBuilding = false;
let firstCompilationHash: string | null = null;
let lastCompilationHash: string | null = null;

connection.onmessage = function (event) {
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

      tryApplyUpdates().then(() => {
        showRuntimeErrors();
      });

      break;

    case 'still-ok':
      isBuilding = false;

      hideNotification().then(() => {
        showRuntimeErrors();
      });

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
          message: formatCompiliationError(message.data[0]),
        }),
        { pointerEvents: 'auto' }
      );

      break;
  }
};

function tryApplyUpdates(): Promise<any> {
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

function showRuntimeErrors() {
  if (!isBuilding && runtimeErrorCount > 0) {
    showNotification(
      runtimeErrorsTemplate({
        count: runtimeErrorCount,
      })
    );
  }
}

window.addEventListener('error', () => {
  runtimeErrorCount++;

  showRuntimeErrors();

  return false;
});

window.addEventListener('unhandledrejection', () => {
  runtimeErrorCount++;

  showRuntimeErrors();

  return false;
});
