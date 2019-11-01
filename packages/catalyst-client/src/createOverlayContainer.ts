import createOverlayFrame from './createOverlayFrame';

let overlayContainerPromise: Promise<{
  frame: HTMLIFrameElement;
  container: HTMLDivElement;
}> | null = null;

export default function createOverlayContainer(): Promise<{
  frame: HTMLIFrameElement;
  container: HTMLDivElement;
}> {
  if (overlayContainerPromise != null) {
    return overlayContainerPromise;
  }

  overlayContainerPromise = new Promise((resolve, reject) => {
    createOverlayFrame()
      .then((elements) => {
        if (elements.frame.contentDocument == null) {
          reject();
          return;
        }

        const container = elements.frame.contentDocument.createElement('div');

        container.id = 'container';
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
