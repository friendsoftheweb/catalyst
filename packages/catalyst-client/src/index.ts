import SockJS from 'sockjs-client';
import { SourceMapConsumer } from 'source-map';
import createOverlayFrame from './utils/createOverlayFrame';
import { getSourceLocation } from './getSourceLocation';
import { messageForRuntimeError } from './utils/messageForRuntimeError';
import {
  contextPath,
  devServerProtocol,
  devServerHost,
  devServerPort,
  ignoredRuntimeErrors,
} from './configuration';
import { FrameState, DevServerEvent, CatalystClient } from './types';
import './updateImageOverlays';

declare global {
  interface Window {
    __CATALYST__?: CatalystClient;
  }
}

let overlayFrameVisible = true;
let overlayFramePointerEvents = 'none';
let overlayFrameState: FrameState = null;
let runtimeErrorCount = 0;
let runtimeErrorLocation: string | undefined;
let runtimeErrorMessage: string | undefined;
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

if (
  devServerProtocol == null ||
  devServerHost == null ||
  devServerPort == null ||
  contextPath == null
) {
  throw new Error('Invalid Catalyst client configuration object');
}

const devServerURI = `${devServerProtocol}://${devServerHost}:${devServerPort}`;

const connection = new SockJS(`${devServerURI}/sockjs-node`);

connection.onmessage = function ({ data }: { data: string }) {
  const event: DevServerEvent = JSON.parse(data);

  switch (event.type) {
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
        firstCompilationHash = event.data;
      }

      lastCompilationHash = event.data;
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
      console.warn(...event.data.map((warning) => warning.message));

      tryApplyUpdates();

      break;

    case 'errors':
      isBuilding = false;

      showNotification(
        {
          component: 'CompilationError',
          props: {
            message: event.data[0].message,
            contextPath,
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
      message: runtimeErrorMessage,
      location: runtimeErrorLocation,
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

  if (ignoredRuntimeErrors.some((regexp) => regexp.test(event.message))) {
    return false;
  }

  runtimeErrorCount++;

  const message = messageForRuntimeError(event.error);

  if (message != null) {
    runtimeErrorMessage = message;
    runtimeErrorLocation = undefined;
  }

  showRuntimeErrors();

  getSourceLocation(event)
    .then((position) => {
      if (position.source == null || position.line == null) {
        return;
      }

      const errorPath = position.source.replace('webpack:///', '');
      const errorLine = position.line;

      runtimeErrorLocation = `${errorPath}:${errorLine}`;

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

if (window.__CATALYST__ != null) {
  window.__CATALYST__.logger = {
    error(messageOrOptions: string | { message: string; location: string }) {
      runtimeErrorCount++;

      if (typeof messageOrOptions === 'string') {
        runtimeErrorMessage = messageOrOptions;
        runtimeErrorLocation = undefined;
      } else {
        runtimeErrorMessage = messageOrOptions.message;
        runtimeErrorLocation = messageOrOptions.location;
      }

      showRuntimeErrors();
    },
  };
}
