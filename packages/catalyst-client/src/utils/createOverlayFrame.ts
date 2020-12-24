let overlayFramePromise: Promise<{ frame: HTMLIFrameElement }> | null = null;

const {
  devServerProtocol,
  devServerPort,
  devServerHost,
} = window.__CATALYST_ENV__;

export default function createOverlayFrame(): Promise<{
  frame: HTMLIFrameElement;
}> {
  if (overlayFramePromise != null) {
    return overlayFramePromise;
  }

  overlayFramePromise = new Promise((resolve) => {
    const frame = document.createElement('iframe');

    frame.src = `${devServerProtocol}://${devServerHost}:${devServerPort}/frame`;
    frame.style.position = 'fixed';
    frame.style.left = '0';
    frame.style.top = '0';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '100vw';
    frame.style.height = '100vh';
    frame.style.border = 'none';
    frame.style.zIndex = '9999999999';
    frame.style.display = 'none';

    frame.onload = function () {
      resolve({ frame: frame });
    };

    document.body.appendChild(frame);
  });

  return overlayFramePromise;
}
