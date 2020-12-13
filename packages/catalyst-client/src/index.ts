declare global {
  interface Window {
    __CATALYST_ENV__: {
      devServerProtocol: string;
      devServerHost: string;
      devServerPort: string;
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
import { SourceMapConsumer } from 'source-map';

let overlayFrameVisible = true;
let overlayFramePointerEvents = 'none';
let overlayFrameState: FrameState = null;
let runtimeErrorCount = 0;
let runtimeErrorMessage: string | undefined;
let runtimeErrorPath: string | undefined;
let runtimeErrorLine: number | undefined;

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

const {
  devServerProtocol,
  devServerHost,
  devServerPort,
} = window.__CATALYST_ENV__;

const devServerURI = `${devServerProtocol}://${devServerHost}:${devServerPort}`;

const connection = new SockJS(`${devServerURI}/sockjs-node`);

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
        location: `${
          runtimeErrorPath != null
            ? runtimeErrorPath.replace('webpack:///', '')
            : ''
        }:${runtimeErrorLine}`,
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

  if (error.message.endsWith('is not a function')) {
    return error.message;
  }

  return 'other';
}

// @ts-expect-error: The types for this library seem to be incorrect
SourceMapConsumer.initialize({
  'lib/mappings.wasm': `${devServerURI}/mappings.wasm`,
});

const sourceMapPromises: Record<string, Promise<string>> = {};

const getSourceLocation = async (
  errorEvent: ErrorEvent
): Promise<{ source: string; line: number; column: number }> => {
  const sourceMapURI = `${errorEvent.filename}.map`;

  if (sourceMapPromises[sourceMapURI] == null) {
    sourceMapPromises[sourceMapURI] = fetch(sourceMapURI)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load source map: ${sourceMapURI}`);
        }

        return response;
      })
      .then((response) => response.json());
  }

  const sourceMap = await sourceMapPromises[sourceMapURI];

  let position;

  await SourceMapConsumer.with(sourceMap, null, (consumer) => {
    position = consumer.originalPositionFor({
      line: errorEvent.lineno,
      column: errorEvent.colno,
    });
  });

  // Allow source map content to be garbage-collected
  delete sourceMapPromises[sourceMapURI];

  if (position == null) {
    throw new Error('Failed to look up source map location');
  }

  return position;
};

window.addEventListener('error', (event) => {
  runtimeErrorCount++;
  runtimeErrorMessage = messageForError(event.error);

  showRuntimeErrors();

  getSourceLocation(event).then((position) => {
    runtimeErrorPath = position.source;
    runtimeErrorLine = position.line;

    showRuntimeErrors();
  });

  return false;
});

window.addEventListener('unhandledrejection', () => {
  runtimeErrorCount++;
  showRuntimeErrors();

  return false;
});
