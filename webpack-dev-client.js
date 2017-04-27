// Heavily inspired by:
// https://github.com/facebookincubator/create-react-app/blob/master/packages/react-dev-utils/webpackHotDevClient.js

const SockJS = require('sockjs-client');
const url = require('url');
const environment = require('./utils/environment');

const red = '#E36049';

let isFirstCompilation = true;
let overlayIframe = null;
let overlayDiv = null;
let lastOnOverlayDivReady = null;

function createOverlayIframe(onIframeLoad) {
  const iframe = document.createElement('iframe');

  iframe.src = 'about:blank';
  iframe.style.position = 'fixed';
  iframe.style.left = 0;
  iframe.style.top = 0;
  iframe.style.right = 0;
  iframe.style.bottom = 0;
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.border = 'none';
  iframe.style.zIndex = 9999999999;
  iframe.onload = onIframeLoad;

  return iframe;
}

function addOverlayDivTo(iframe) {
  const div = iframe.contentDocument.createElement('div');

  div.style.position = 'fixed';
  div.style.boxSizing = 'border-box';
  div.style.left = 0;
  div.style.top = 0;
  div.style.right = 0;
  div.style.bottom = 0;
  div.style.width = '100vw';
  div.style.height = '100vh';
  div.style.backgroundColor = '#fafafa';
  div.style.color = '#333';
  div.style.fontFamily = 'Menlo, Consolas, monospace';
  div.style.fontSize = 'large';
  div.style.padding = '2rem';
  div.style.lineHeight = '1.2';
  div.style.whiteSpace = 'pre-wrap';
  div.style.overflow = 'auto';

  iframe.contentDocument.body.appendChild(div);

  return div;
}

function ensureOverlayDivExists(onOverlayDivReady) {
  if (overlayDiv) {
    // Everything is ready, call the callback right away.
    onOverlayDivReady(overlayDiv);
    return;
  }

  // Creating an iframe may be asynchronous so we'll schedule the callback.
  // In case of multiple calls, last callback wins.
  lastOnOverlayDivReady = onOverlayDivReady;

  if (overlayIframe) {
    // We're already creating it.
    return;
  }

  // Create iframe and, when it is ready, a div inside it.
  overlayIframe = createOverlayIframe(function onIframeLoad() {
    overlayDiv = addOverlayDivTo(overlayIframe);
    // Now we can talk!
    lastOnOverlayDivReady(overlayDiv);
  });

  // Zalgo alert: onIframeLoad() will be called either synchronously
  // or asynchronously depending on the browser.
  // We delay adding it so `overlayIframe` is set when `onIframeLoad` fires.
  document.body.appendChild(overlayIframe);
}

function showErrorOverlay(message) {
  ensureOverlayDivExists(function onOverlayDivReady(overlayDiv) {
    // Make it look similar to our terminal.
    overlayDiv.innerHTML =
      '<span style="color: ' + red + '">Failed to compile.</span><br><br>' + message;
  });
}

function tryApplyUpdates() {
  if (isFirstCompilation) {
    isFirstCompilation = false;
    return;
  }

  if (!module.hot) {
    window.location.reload();
    return;
  }

  if (module.hot.status() !== 'idle') {
    return;
  }

  console.log('Applying update');

  module.hot.check(true).then(
    () => {
      console.log('HMR update applied');
    },
    () => {
      window.location.reload();
    }
  );
}

const connection = new SockJS(
  url.format({
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: environment().devServerPort,
    // Hardcoded in WebpackDevServer
    pathname: '/sockjs-node'
  })
);

connection.onmessage = function(event) {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'ok':
      tryApplyUpdates();
      break;
    case 'errors':
      showErrorOverlay(message.data.toString().replace(/\[\d\d?m/g, ''));
      break;
  }
};
