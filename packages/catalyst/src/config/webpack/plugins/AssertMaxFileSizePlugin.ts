import { Compiler, WebpackError, WebpackPluginInstance } from 'webpack';
import { IMAGE_FILE_PATTERN } from '../../../patterns';
import formatBytes from '../../../utils/formatBytes';

interface Options {
  maxScriptAssetSize: number;
  maxImageAssetSize: number;
}

export default class AssertMaxAssetSizePlugin implements WebpackPluginInstance {
  private readonly options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'AssertMaxAssetSizePlugin',
      (compilation) => {
        const largeScriptAssets: Record<string, number> = {};
        const largeImageAssets: Record<string, number> = {};

        let largestScriptAssetSize = 0;
        let largestImageAssetSize = 0;

        compilation.hooks.afterOptimizeAssets.tap(
          'AssertMaxAssetSizePlugin',
          (assets) => {
            for (const [name, source] of Object.entries(assets)) {
              const size = source.size();

              if (/\.js$/i.test(name)) {
                if (size > this.maxScriptAssetSize) {
                  largeScriptAssets[name] = size;

                  if (size > largestScriptAssetSize) {
                    largestScriptAssetSize = size;
                  }
                }
              } else if (IMAGE_FILE_PATTERN.test(name)) {
                if (size > this.maxImageAssetSize) {
                  largeImageAssets[name] = size;

                  if (size > largestImageAssetSize) {
                    largestImageAssetSize = size;
                  }
                }
              }
            }

            if (Object.keys(largeScriptAssets).length > 0) {
              compilation.errors.push(
                new WebpackError(
                  [
                    `Some script assets are larger than the maximum allowable size (${formatBytes(
                      this.maxScriptAssetSize
                    )}):`,
                    ...Object.entries(largeScriptAssets).map(
                      ([name, size]) => `  - ${name} (${formatBytes(size)})`
                    ),
                    '',
                    'To reduce the size of script assets try:',
                    '  - Splitting them by using dynamic imports',
                    '  - Switching to smaller dependencies that solve the same problem (e.g. use date-fns instead of moment)',
                    '  - Increasing the value of "optimizationCommonMinChunks" to exclude large dependencies from the common chunk',
                    '  - Adding entries to "optimizationCommonExcludedChunks" to exclude their dependencies from the common chunk',
                    '',
                    `If you want to increase the maximum allowable script size, set "maxScriptAssetSizeKB" to at least ${Math.ceil(
                      largestScriptAssetSize / 1024
                    )} in "catalyst.config.json".`,
                  ].join('\n')
                )
              );
            }

            if (Object.keys(largeImageAssets).length > 0) {
              compilation.errors.push(
                new WebpackError(
                  [
                    `Some image assets are larger than the maximum allowable size (${formatBytes(
                      this.maxImageAssetSize
                    )}):`,
                    ...Object.entries(largeImageAssets).map(
                      ([name, size]) => `  - ${name} (${formatBytes(size)})`
                    ),
                    '',
                    'To reduce the size of image assets try:',
                    '  - Reducing the overall resolution of the source image',
                    '  - Optimizing them using tools such as ImageOptim, ImageAlpha, or Squoosh',
                    '  - Exporting images using a lossy format (e.g. JPEG) at a lower quality setting',
                    '  - Exporting images using an image format with better compression (e.g. WebP)',
                    '',
                    `If you want to increase the maximum allowable image size, set "maxImageAssetSizeKB" to at least ${Math.ceil(
                      largestImageAssetSize / 1024
                    )} in "catalyst.config.json".`,
                  ].join('\n')
                )
              );
            }
          }
        );
      }
    );
  }

  private get maxScriptAssetSize(): number {
    return this.options.maxScriptAssetSize;
  }

  private get maxImageAssetSize(): number {
    return this.options.maxImageAssetSize;
  }
}
