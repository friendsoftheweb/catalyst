declare global {
  interface Window {
    __CATALYST_ENV__: {
      devServerProtocol: string;
      devServerHost: string;
      devServerPort: number;
    };
  }

  interface NodeModule {
    hot: {
      status(): 'idle';
      check(autoApply: boolean): Promise<unknown>;
    };
  }
}

import SockJS from 'sockjs-client';
import createOverlayFrame from './createOverlayFrame';
import formatCompiliationError from './formatCompilationError';
import { FrameState } from './types';

let overlayFrameVisible = true;
let overlayFramePointerEvents = 'none';
let overlayFrameState: FrameState = null;
let runtimeErrorCount = 0;
let runtimeErrorMessage: string | undefined;

async function updateOverlayContainer() {
  const { frame } = await createOverlayFrame();

  frame.style.display = overlayFrameVisible ? 'block' : 'none';
  frame.style.pointerEvents = overlayFramePointerEvents;

  if (frame.contentWindow != null) {
    frame.contentWindow.postMessage(JSON.stringify(overlayFrameState), '*');
  }
}

function showNotification(
  state: FrameState,
  options: { pointerEvents: 'auto' | 'none' } = { pointerEvents: 'none' }
) {
  overlayFrameState = state;
  overlayFrameVisible = true;
  overlayFramePointerEvents = options.pointerEvents;

  return updateOverlayContainer();
}

function hideNotification() {
  overlayFrameState = null;
  overlayFrameVisible = false;

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

        showNotification({
          component: 'Activity',
          props: {
            message: 'Building…',
          },
        });
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
        {
          component: 'CompilationError',
          props: {
            message: formatCompiliationError(message.data[0]),
          },
        },
        { pointerEvents: 'auto' }
      );

      break;
  }
};

function tryApplyUpdates(): Promise<unknown> {
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
    showNotification({
      component: 'RuntimeErrors',
      props: {
        count: runtimeErrorCount,
        message: runtimeErrorMessage,
      },
    });
  }
}

function messageForError(error: Error): string | undefined {
  if (error.name === 'ReferenceError') {
    return error.message;
  }

  if (error.message.startsWith('Element type is invalid')) {
    return error.message;
  }
}

window.addEventListener('error', (error) => {
  runtimeErrorCount++;

  runtimeErrorMessage = messageForError(error.error);
  showRuntimeErrors();

  console.log({ error: error.error });
  console.log(error.error.stack.split('\n'));

  return false;
});

window.addEventListener('unhandledrejection', () => {
  runtimeErrorCount++;
  showRuntimeErrors();

  return false;
});
