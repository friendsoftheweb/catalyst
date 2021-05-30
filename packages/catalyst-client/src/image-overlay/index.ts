import {
  appendImageOverlay,
  CatalystImageOverlay,
  imageOverlays,
  removeImageOverlay,
} from './CatalystImageOverlay';

window.customElements.define('catalyst-image-overlay', CatalystImageOverlay);

const handleWindowResize = () => {
  hideImageOverlays();

  debouncedUpdateImageOverlays();
};

const handleWindowScroll = () => {
  debouncedUpdateImageOverlays();
};

export const enableImageOverlays = (): void => {
  connectMutationObserver();

  for (const overlay of Array.from(imageOverlays.values())) {
    document.body.appendChild(overlay);
  }

  for (const imageNode of Array.from(document.images)) {
    if (!imageOverlays.has(imageNode)) {
      appendImageOverlay(imageNode);
    }
  }

  window.addEventListener('resize', handleWindowResize);
  window.addEventListener('scroll', handleWindowScroll);

  debouncedUpdateImageOverlays();

  console.log('[Catalyst] Image debugging enabled');
};

export const disableImageOverlays = (): void => {
  disconnectMutationObserver();

  for (const overlay of Array.from(imageOverlays.values())) {
    document.body.removeChild(overlay);
  }

  window.removeEventListener('resize', handleWindowResize);
  window.removeEventListener('scroll', handleWindowScroll);

  console.log('[Catalyst] Image debugging disabled');
};

let observer: MutationObserver;

const connectMutationObserver = () => {
  observer = new MutationObserver((records) => {
    let nodesAdded = false;

    for (const record of records) {
      if (record.addedNodes.length > 0) {
        nodesAdded = true;
      }

      for (const removedNode of Array.from(record.removedNodes)) {
        for (const imageNode of Array.from(imageOverlays.keys())) {
          if (removedNode.contains(imageNode)) {
            removeImageOverlay(imageNode);
          }
        }
      }
    }

    if (nodesAdded) {
      for (const imageNode of Array.from(document.images)) {
        if (!imageOverlays.has(imageNode)) {
          appendImageOverlay(imageNode);

          debouncedUpdateImageOverlays();
        }
      }
    }
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
  });
};

const disconnectMutationObserver = () => {
  observer?.disconnect();
};

const updateImageOverlays = async () => {
  for (const overlay of Array.from(imageOverlays.values())) {
    overlay.update();
  }
};

const hideImageOverlays = () => {
  for (const overlay of Array.from(imageOverlays.values())) {
    overlay.hide();
  }
};

let updateTimeout: ReturnType<typeof window.setTimeout>;

const debouncedUpdateImageOverlays = () => {
  if (updateTimeout != null) {
    clearTimeout(updateTimeout);
  }

  updateTimeout = setTimeout(updateImageOverlays, 500);
};
