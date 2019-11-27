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
import { h, render } from 'preact';

import createOverlayContainer from './createOverlayContainer';
import formatCompiliationError from './formatCompilationError';

let overlayContainerNode: preact.ComponentChild | null = null;
let overlayFrameVisible = false;
let overlayFramePointerEvents = 'none';
let runtimeErrorCount = 0;
let runtimeErrorMessage: string | undefined;

import Activity from './components/Activity';
import RuntimeErrors from './components/RuntimeErrors';
import CompilationError from './components/CompilationError';

async function updateOverlayContainer() {
  const { frame, container } = await createOverlayContainer();

  frame.style.display = overlayFrameVisible ? 'block' : 'none';
  frame.style.pointerEvents = overlayFramePointerEvents;

  container.style.backgroundColor =
    overlayFramePointerEvents === 'none'
      ? 'transparent'
      : 'rgba(255,255,255,0.25)';

  render(overlayContainerNode, container);
}

function showNotification(
  node: preact.ComponentChild,
  options: { pointerEvents: 'auto' | 'none' } = { pointerEvents: 'none' }
) {
  overlayContainerNode = node;
  overlayFrameVisible = true;
  overlayFramePointerEvents = options.pointerEvents;

  return updateOverlayContainer();
}

function hideNotification() {
  overlayContainerNode = null;
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

connection.onmessage = function(event) {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'invalid':
      if (!isBuilding) {
        isBuilding = true;

        showNotification(h(Activity, { message: 'Building...' }));
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
        h(CompilationError, {
          message: formatCompiliationError(message.data[0])
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
      h(RuntimeErrors, {
        count: runtimeErrorCount,
        message: runtimeErrorMessage
      })
    );
  }
}

// function shouldDisplayErrorOverlay(error: ErrorEvent): boolean {
//   return /^Error: Element type is invalid/.test(error.message);
// }

function messageForError(error: Error): string | undefined {
  if (error.name === 'ReferenceError') {
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
