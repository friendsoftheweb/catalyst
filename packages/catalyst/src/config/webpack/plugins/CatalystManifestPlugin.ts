import { Compiler, Compilation, WebpackPluginInstance } from 'webpack';
import { RawSource } from 'webpack-sources';

/**
 * Generates a "catalyst.json" file with a list of files to prefetch via
 * `<link rel="prefetch" />`.
 */
export default class CatalystManifestPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap('CatalystManifestPlugin', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'CatalystManifestPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async (assets) => {
          if (Object.keys(assets).includes('*')) {
            // Skip every processAssets call except for the last one
            return;
          }

          const stats = compilation.getStats().toJson({ source: true }) as {
            entrypoints: Record<string, Entrypoint>;
            chunks: Chunk[];
            assets: Asset[];
          };

          const initialChunks = stats.chunks.filter(({ initial }) => initial);

          const preload: Record<string, string[]> = {};
          const prefetch: Record<string, string[]> = {};

          for (const chunk of initialChunks) {
            const entrypoint = Object.values(
              stats.entrypoints
            ).find(({ chunks }) => chunks.includes(chunk.id));

            if (entrypoint == null) {
              continue;
            }

            const entrypointChunks = initialChunks.filter(({ id }) =>
              entrypoint.chunks.includes(id)
            );

            for (const asset of stats.assets) {
              const assetName = asset.info.sourceFilename ?? asset.name;

              if (
                !/\.(js|css)(\.map)?$/.test(assetName) &&
                chunksReferenceAsset(entrypointChunks, asset)
              ) {
                // Fonts should almost always be preloaded
                if (/\.(woff2?|ttf|eot)$/.test(assetName)) {
                  if (preload[entrypoint.name] == null) {
                    preload[entrypoint.name] = [];
                  }

                  preload[entrypoint.name].push(assetName);
                } else {
                  if (prefetch[entrypoint.name] == null) {
                    prefetch[entrypoint.name] = [];
                  }

                  prefetch[entrypoint.name].push(assetName);
                }
              }
            }
          }

          const prefetchChunks = collectPrefetchChunks(stats.chunks);

          for (const chunk of prefetchChunks) {
            const parentChunk = findParentChunk(stats.chunks, chunk);

            if (parentChunk == null) {
              continue;
            }

            const entrypoint = Object.values(
              stats.entrypoints
            ).find(({ chunks }) => chunks.includes(parentChunk.id));

            if (entrypoint == null) {
              continue;
            }

            for (const asset of stats.assets) {
              const assetName = asset.info.sourceFilename ?? asset.name;

              if (
                preload[entrypoint.name]?.includes(assetName) ||
                prefetch[entrypoint.name]?.includes(assetName)
              ) {
                continue;
              }

              if (chunksReferenceAsset(prefetchChunks, asset)) {
                if (prefetch[entrypoint.name] == null) {
                  prefetch[entrypoint.name] = [];
                }

                prefetch[entrypoint.name].push(assetName);
              }
            }
          }

          compilation.emitAsset(
            'catalyst.json',
            new RawSource(JSON.stringify({ preload, prefetch }, null, 2))
          );
        }
      );
    });
  }
}

interface Entrypoint {
  name: string;
  chunks: number[];
}

interface Asset {
  name: string;
  chunks: number[];
  auxiliaryChunks: number[];
  info: {
    sourceFilename?: string;
  };
}

interface Chunk {
  id: number;
  initial: boolean;
  modules: Module[];
  parents: number[];
}

interface Module {
  id: number;
  chunks: number[];
  source?: string;
  modules?: Module[];
}

const collectPrefetchChunks = (chunks: Chunk[]) =>
  chunks.filter(
    (chunk) => !chunk.initial && chunk.modules.some(shouldPrefetchModule)
  );

const shouldPrefetchModule = (module: Module): boolean => {
  if (
    module.source != null &&
    /^\/\/\s+@catalyst-prefetch$/m.test(module.source)
  ) {
    return true;
  }

  if (module.modules != null) {
    return module.modules.some(shouldPrefetchModule);
  }

  return false;
};

const findParentChunk = (chunks: Chunk[], chunk: Chunk): Chunk | undefined => {
  if (chunk.parents.length === 0) {
    return chunk;
  }

  const parent = chunks.find(({ id }) => chunk.parents.includes(id));

  if (parent == null) {
    return;
  }

  return findParentChunk(chunks, parent);
};

const chunksReferenceAsset = (chunks: Chunk[], asset: Asset) => {
  return (
    asset.chunks.some((chunkId: number) =>
      chunks.find((chunk) => chunk.id === chunkId)
    ) ||
    asset.auxiliaryChunks.some((chunkId: number) =>
      chunks.find((chunk) => chunk.id === chunkId)
    )
  );
};
