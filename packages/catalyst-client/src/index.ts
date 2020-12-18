declare global {
  interface Window {
    __CATALYST_ENV__: {
      devServerProtocol: string;
      devServerHost: string;
      devServerPort: string;
    };
  }
}

import SockJS from 'sockjs-client';
import { SourceMapConsumer } from 'source-map';
import createOverlayFrame from './createOverlayFrame';
import { getSourceLocation } from './getSourceLocation';
import { messageForError } from './messageForError';
import { FrameState } from './types';

let overlayFrameVisible = true;
let overlayFramePointerEvents = 'none';
let overlayFrameState: FrameState = null;
let runtimeErrorCount = 0;
let runtimeErrorMessage: string | undefined;
let runtimeErrorPath: string | undefined;
let runtimeErrorLine: number | undefined;
let isBuilding = false;
let firstCompilationHash: string | null = null;
let lastCompilationHash: string | null = null;

async function updateOverlayContainer() {
  const { frame } = await createOverlayFrame();

  frame.style.display = overlayFrameVisible ? 'block' : 'none';
  frame.style.pointerEvents = overlayFramePointerEvents;

  if (frame.contentWindow != null) {
    frame.contentWindow.postMessage(JSON.stringify(overlayFrameState), '*');
  }
}

const showNotification = (
  state: FrameState,
  options: { pointerEvents: 'auto' | 'none' } = { pointerEvents: 'none' }
) => {
  overlayFrameState = state;
  overlayFrameVisible = true;
  overlayFramePointerEvents = options.pointerEvents;

  return updateOverlayContainer();
};

const hideNotification = () => {
  overlayFrameState = null;
  overlayFrameVisible = false;

  return updateOverlayContainer();
};

const {
  devServerProtocol,
  devServerHost,
  devServerPort,
} = window.__CATALYST_ENV__;

if (
  devServerProtocol == null ||
  devServerHost == null ||
  devServerPort == null
) {
  throw new Error('Invalid Catalyst client configuration object');
}

const devServerURI = `${devServerProtocol}://${devServerHost}:${devServerPort}`;

const connection = new SockJS(`${devServerURI}/sockjs-node`);

connection.onmessage = function (event) {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'invalid':
      if (!isBuilding) {
        isBuilding = true;

        showNotification({
          component: 'Activity',
          props: {
            message: 'Building...',
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

      tryApplyUpdates();

      break;

    case 'errors':
      isBuilding = false;

      showNotification(
        {
          component: 'CompilationError',
          props: {
            message: message.data[0],
          },
        },
        { pointerEvents: 'auto' }
      );

      break;
  }
};

const tryApplyUpdates = async () => {
  if (firstCompilationHash === lastCompilationHash) {
    return;
  }

  if (!module.hot) {
    window.location.reload();

    return;
  }

  if (module.hot.status() !== 'idle') {
    await hideNotification();

    return;
  }

  try {
    if (module.hot != null) {
      const { check } = module.hot;

      await new Promise((resolve) => {
        check(true, resolve);
      });
    }

    await hideNotification();
  } catch (error) {
    window.location.reload();

    throw error;
  }
};

const showRuntimeErrors = async () => {
  if (isBuilding || runtimeErrorCount === 0) {
    return;
  }

  await showNotification({
    component: 'RuntimeErrors',
    props: {
      count: runtimeErrorCount,
      location:
        runtimeErrorPath != null && runtimeErrorLine != null
          ? `${runtimeErrorPath.replace('webpack:///', '')}:${runtimeErrorLine}`
          : undefined,
      message: runtimeErrorMessage,
    },
  });
};

// @ts-expect-error: The types for this library seem to be incorrect
SourceMapConsumer.initialize({
  'lib/mappings.wasm': `${devServerURI}/mappings.wasm`,
});

window.addEventListener('error', (event) => {
  if (event.message.startsWith('Error: Module build failed')) {
    return false;
  }

  runtimeErrorCount++;
  runtimeErrorMessage = messageForError(event.error);

  showRuntimeErrors();

  getSourceLocation(event)
    .then((position) => {
      if (position.source == null || position.line == null) {
        return;
      }

      runtimeErrorPath = position.source;
      runtimeErrorLine = position.line;

      showRuntimeErrors();
    })
    .catch((error) => {
      console.warn(
        `Failed to look up source map location for error:\n\n${error.message}`
      );
    });

  return false;
});

window.addEventListener('unhandledrejection', () => {
  runtimeErrorCount++;
  showRuntimeErrors();

  return false;
});
