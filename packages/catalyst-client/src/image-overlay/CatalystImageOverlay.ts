import { getNaturalImageDimensions } from './getNaturalImageDimensions';

export const imageOverlays = new Map<HTMLImageElement, CatalystImageOverlay>();

const GREEN_COLOR = 'rgba(0,200,83,0.85)';
const RED_COLOR = 'rgba(213,0,0,0.85)';

export const appendImageOverlay = (imageNode: HTMLImageElement): void => {
  if (imageOverlays.has(imageNode)) {
    return;
  }

  const overlay = new CatalystImageOverlay(imageNode);

  imageOverlays.set(imageNode, overlay);

  document.body.appendChild(overlay);
};

export const removeImageOverlay = (imageNode: HTMLImageElement): void => {
  const imageOverlay = imageOverlays.get(imageNode);

  if (imageOverlay == null) {
    return;
  }

  imageOverlays.delete(imageNode);

  document.body.removeChild(imageOverlay);
};

export class CatalystImageOverlay extends HTMLElement {
  private readonly imageNode: HTMLImageElement;
  private dimensionsNode?: HTMLDivElement;
  private descriptionNode?: HTMLDivElement;

  constructor(imageNode: HTMLImageElement) {
    super();

    this.imageNode = imageNode;

    this.style.color = 'white';
    this.style.padding = '2px 4px';
    this.style.fontFamily = "'Fira Code', Menlo, Consolas, monospace";
    this.style.fontSize = '10px';
    this.style.position = 'absolute';
    this.style.zIndex = '9999';
    this.style.pointerEvents = 'none';
    this.style.transition = 'opacity 200ms';
    this.style.outlineStyle = 'solid';
    this.style.outlineWidth = '2px';

    const dimensionsNode = document.createElement('div');

    dimensionsNode.style.padding = '2px 4px';
    dimensionsNode.style.position = 'absolute';
    dimensionsNode.style.top = '0';
    dimensionsNode.style.left = '0';

    const descriptionNode = document.createElement('div');

    descriptionNode.style.padding = '2px 4px';
    descriptionNode.style.position = 'absolute';
    descriptionNode.style.bottom = '0';
    descriptionNode.style.right = '0';

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.appendChild(dimensionsNode);
    shadowRoot.appendChild(descriptionNode);

    this.dimensionsNode = dimensionsNode;
    this.descriptionNode = descriptionNode;
  }

  connectedCallback() {
    this.update();
  }

  disconnectedCallback() {
    this.dimensionsNode = undefined;
    this.descriptionNode = undefined;
  }

  async update() {
    if (this.dimensionsNode == null || this.descriptionNode == null) {
      return;
    }

    if (this.imageNode.currentSrc.endsWith('.svg')) {
      this.hide();

      return;
    }

    const imageRect = this.imageNode.getBoundingClientRect();

    try {
      const {
        width: naturalWidth,
        height: naturalHeight,
      } = await getNaturalImageDimensions(this.imageNode);

      if (naturalWidth === 0 || imageRect.width === 0) {
        this.style.opacity = '0';

        return;
      }

      const imagePixelRatio = naturalWidth / imageRect.width;

      this.dimensionsNode.innerText = `${naturalWidth}ｘ${naturalHeight} (${imagePixelRatio.toFixed(
        1
      )}/${window.devicePixelRatio})`;

      const minPixelRatio = Math.min(window.devicePixelRatio, 1.5);
      const maxPixelRatio = window.devicePixelRatio + 0.5;

      if (
        imagePixelRatio >= minPixelRatio &&
        imagePixelRatio <= maxPixelRatio
      ) {
        this.style.outlineColor = GREEN_COLOR;
        this.dimensionsNode.style.backgroundColor = GREEN_COLOR;
        this.descriptionNode.style.backgroundColor = GREEN_COLOR;
      } else {
        this.style.outlineColor = RED_COLOR;
        this.dimensionsNode.style.backgroundColor = RED_COLOR;
        this.descriptionNode.style.backgroundColor = RED_COLOR;
      }

      this.descriptionNode.innerText = this.imageNode.getAttribute('alt') ?? '';

      const top = document.documentElement.scrollTop + imageRect.top;
      const left = document.documentElement.scrollLeft + imageRect.left;

      this.style.top = `${top}px`;
      this.style.left = `${left}px`;
      this.style.width = `${imageRect.width}px`;
      this.style.height = `${imageRect.height}px`;
      this.style.opacity = '1';
    } catch {}
  }

  hide() {
    this.style.opacity = '0';
  }
}
