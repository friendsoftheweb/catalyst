const naturalImageDimensions = new Map<
  string,
  { width: number; height: number }
>();

export const getNaturalImageDimensions = async (
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
