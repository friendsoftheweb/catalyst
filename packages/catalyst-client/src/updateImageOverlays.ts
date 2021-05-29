let imageOverlaysEnabled = false;
let observer: MutationObserver;

const imageNodes = new Set<HTMLImageElement>();
const annotations = new WeakMap<HTMLImageElement, HTMLDivElement>();

window.addEventListener('keypress', (event) => {
  if (event.ctrlKey && event.key === 'd') {
    event.preventDefault();

    imageOverlaysEnabled = !imageOverlaysEnabled;

    if (imageOverlaysEnabled) {
      observer = new MutationObserver((records) => {
        // console.log(...records);

        let nodesAdded = false;

        for (const record of records) {
          if (record.addedNodes.length > 0) {
            nodesAdded = true;
          }

          for (const removedNode of Array.from(record.removedNodes)) {
            for (const imageNode of Array.from(imageNodes)) {
              if (removedNode.contains(imageNode)) {
                console.log('removed', imageNode);

                annotations.get(imageNode)?.remove();

                imageNodes.delete(imageNode);
              }
            }
          }
        }

        // console.log({ nodesAdded });

        if (nodesAdded) {
          for (const node of Array.from(document.images)) {
            if (!imageNodes.has(node)) {
              console.log('added', node);

              imageNodes.add(node);
            }
          }
        }
      });

      observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['src', 'width', 'height', 'alt'],
      });
    } else if (observer != null) {
      observer.disconnect();
    }

    updateImageOverlays();
  }
});

const naturalImageDimensions = new Map<
  string,
  { width: number; height: number }
>();

const getNaturalImageDimensions = async (
  element: HTMLImageElement
): Promise<{ width: number; height: number }> => {
  if (naturalImageDimensions.has(element.currentSrc)) {
    return naturalImageDimensions.get(element.currentSrc)!;
  }

  if (element.srcset == null) {
    if (element.naturalWidth > 0 && element.naturalHeight > 0) {
      naturalImageDimensions.set(element.currentSrc, {
        width: element.naturalWidth,
        height: element.naturalHeight,
      });
    }

    return {
      width: element.naturalWidth,
      height: element.naturalHeight,
    };
  }

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        naturalImageDimensions.set(element.currentSrc, {
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      }

      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = reject;

    image.src = element.currentSrc;
  });
};

const updateImageOverlays = async () => {
  const imageElements = document.getElementsByTagName('img');

  for (const element of Array.from(imageElements)) {
    if (element.currentSrc.endsWith('.svg')) {
      continue;
    }

    let annotation = annotations.get(element);

    try {
      const {
        width: naturalWidth,
        height: naturalHeight,
      } = await getNaturalImageDimensions(element);

      const imageRect = element.getBoundingClientRect();

      if (imageOverlaysEnabled) {
        element.style.outline = 'rgba(255,0,255,0.75) solid 2px';

        if (annotation == null) {
          annotation = document.createElement('div');
          annotation.style.color = 'white';
          annotation.style.padding = '2px 4px';
          annotation.style.fontFamily =
            "'Fira Code', Menlo, Consolas, monospace";
          annotation.style.fontSize = '10px';
          annotation.style.backgroundColor = 'rgba(255,0,255,0.75)';
          annotation.style.position = 'absolute';
          annotation.style.zIndex = '9999';
          annotation.style.pointerEvents = 'none';

          annotations.set(element, annotation);
        }

        document.body.appendChild(annotation);

        const top = document.documentElement.scrollTop + imageRect.top;
        const left = document.documentElement.scrollLeft + imageRect.left;

        annotation.innerText = `${naturalWidth}ｘ${naturalHeight} (${(
          naturalWidth / imageRect.width
        ).toFixed(1)})`;

        annotation.style.top = `${top}px`;
        annotation.style.left = `${left}px`;

        annotation.style.opacity = '1';
      } else {
        element.style.outline = '';

        if (annotation != null && annotation.parentElement != null) {
          document.body.removeChild(annotation);
        }
      }
    } catch (error) {
      element.style.outline = '';

      if (annotation != null && annotation.parentElement != null) {
        document.body.removeChild(annotation);
      }
    }
  }
};

const hideImageAnnotations = () => {
  const imageElements = document.images;

  for (const element of Array.from(imageElements)) {
    if (element.currentSrc.endsWith('.svg')) {
      continue;
    }

    const annotation = annotations.get(element);

    if (annotation != null) {
      annotation.style.opacity = '0';
    }
  }
};

let updateTimeout: ReturnType<typeof window.setTimeout>;

const debouncedUpdateImageOverlays = () => {
  if (updateTimeout != null) {
    clearTimeout(updateTimeout);
  }

  updateTimeout = setTimeout(updateImageOverlays, 250);
};

window.addEventListener('resize', () => {
  hideImageAnnotations();

  debouncedUpdateImageOverlays();
});

window.addEventListener('scroll', () => {
  debouncedUpdateImageOverlays();
});

// class CatalystImage extends HTMLImageElement {
//   static get observedAttributes() {
//     return ['src', 'width', 'height', 'alt'];
//   }

//   constructor() {
//     super();

//     console.log('constucted!');
//   }

//   connectedCallback() {
//     console.log('connected', this.currentSrc);
//   }

//   disconnectedCallback() {
//     console.log('disconnected', this.currentSrc);
//   }

//   attributeChangedCallback(name: string, oldValue: string, newValue: string) {
//     console.log('attribute', { name, oldValue, newValue });
//   }
// }

// window.customElements.define('catalyst-image', CatalystImage, {
//   extends: 'img',
// });
