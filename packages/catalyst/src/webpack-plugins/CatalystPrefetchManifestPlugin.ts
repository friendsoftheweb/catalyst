import { Compiler, Plugin } from 'webpack';
import { RawSource } from 'webpack-sources';

/**
 * Generates a "prefetch.json" file with a list of files to prefetch via
 * <link rel="prefetch" />.
 */
export default class CatalystPrefetchManifestPlugin implements Plugin {
  apply(compiler: Compiler) {
    const prefetchChunkIds = new Set<number>();

    compiler.hooks.emit.tap('CatalystPrefetchManifestPlugin', (compilation) => {
      const { modules, chunks, publicPath } = compilation.getStats().toJson();

      if (modules == null || chunks == null) {
        return;
      }

      for (const module of modules) {
        if (shouldPrefetchModule(module)) {
          for (const id of module.chunks) {
            if (typeof id === 'number') {
              prefetchChunkIds.add(id);
            }
          }
        }
      }

      if (prefetchChunkIds.size === 0) {
        return;
      }

      const prefetchChunkFiles = new Set<string>();

      for (const chunk of chunks) {
        if (chunk.entry || typeof chunk.id !== 'number') {
          continue;
        }

        if (prefetchChunkIds.has(chunk.id)) {
          for (const file of chunk.files) {
            if (!file.endsWith('.map')) {
              prefetchChunkFiles.add(file);
            }
          }
        }
      }

      if (prefetchChunkFiles.size === 0) {
        return;
      }

      // @ts-expect-error: This method is missing from @types/webpack
      compilation.emitAsset(
        'prefetch.json',
        new RawSource(
          JSON.stringify(
            [...prefetchChunkFiles].map((file) => `${publicPath}${file}`)
          )
        )
      );
    });
  }
}

const shouldPrefetchModule = (module: {
  id: string | number;
  modules?: { source?: string; modules?: unknown }[];
}): boolean => {
  if (module.modules == null) {
    return false;
  }

  for (const child of module.modules) {
    if (child.modules != null) {
      throw new Error('Deeply nested modules!');
    }

    if (child.source == null) {
      continue;
    }

    if (/^\/\/\s+@catalyst-prefetch$/m.test(child.source)) {
      return true;
    }
  }

  return false;
};
